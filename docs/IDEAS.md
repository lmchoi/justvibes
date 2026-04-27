# Ideas & Future Improvements

## Audio Pipeline & Recording

### Post-Production & Stem Splitting
- **Bookmark Player:** A dedicated "Review" mode to play back recorded WAV files and drop non-destructive markers (start/end points) to identify the best loops.
- **Stem Isolation:** Ability to split a recorded track into individual stems (e.g., Drums, Bass, Synth) for further remixing or tighter transitions.
- **Segment Export:** One-click export of bookmarked regions as individual high-quality clips.

### Partial Recording Writes (Memory Optimization)
The current recording implementation stores raw PCM chunks in an in-memory array (`recordingChunks`). For long sessions (e.g., the 1-hour target), this can consume ~700MB of RAM.
- **Idea:** Refactor to use the **FileSystem Access API** (`showSaveFilePicker`) to stream chunks directly to disk as they arrive.
- **Alternative:** Use the **MediaRecorder API** connected to a `MediaStreamAudioDestinationNode` to offload encoding and buffering to the browser's native media stack (though this typically results in WebM/Opus rather than raw WAV).
- **Benefit:** Enables stable 1-hour recordings on low-memory devices and prevents browser tab crashes during long sets.

## Long-Form Mix Generation (1-Hour Target)

The Lyria Realtime API has a hard ~10-minute session limit. Reaching a 1-hour continuous mix requires stitching or overlapping multiple sessions. The core challenge is making the seam between sessions inaudible.

### Session Handoff Strategies

- **Seamless Crossfade Handoff (Primary):** ~60–90 seconds before the current session expires, spin up a second Realtime session in the background using the same active prompts/weights. Once it has warmed up and is producing audio, fade the old session out while fading the new one in over a short window (e.g., 3–5 seconds). Both streams run into the same Web Audio graph — use two `GainNode`s with mirrored ramp curves. Record the mixed output continuously so the crossfade is captured to disk as part of the master WAV.

- **Pre-Recorded Bridge Clip:** Use the `lyria-3-clip-preview` API to generate a 30-second clip at the current prompt state. At handoff time, fade from the live session into the pre-generated clip, then fade from the clip into the new session once it is ready. The clip acts as a musical "bridge" and buys time for the new session to stabilize.

- **Hard Cut with Beat Alignment:** Record both the outgoing and incoming sessions briefly in parallel. Detect the closest beat boundary in both buffers (via onset detection or a fixed BPM estimate), then cut at the aligned point. No crossfade — clean DJ-style edit. Simpler to implement than a fade; works especially well with rhythmically rigid genres.

- **Scheduled Session Rotation:** Treat the ~10-minute limit as a known constant. Preemptively schedule handoffs at T−90s using `setTimeout`. Keep a queue of up to 2 sessions (current + standby). The standby session always starts with the same prompt state so the style is continuous. On each handoff, promote standby → current and boot a new standby immediately.

### State Continuity Across Sessions

- **Prompt Snapshot at Handoff:** Before tearing down the expiring session, snapshot the exact prompt text and weight values. Pass them verbatim as the seed for the next session. This is the minimum viable approach to stylistic continuity.

- **Tail Audio as Context (Speculative):** Capture the last ~5 seconds of audio from the expiring session as a raw buffer. If the API ever supports an audio-priming input, send this tail as the initial context for the new session, so it "continues" from where the old one left off rather than cold-starting.

### Recording & Assembly

- **Single Master Recorder:** The Web Audio recording node (`ScriptProcessorNode` or `AudioWorkletProcessor`) should tap the final mixed output — after the crossfade `GainNode`s — so all transitions are captured in one continuous PCM stream. This avoids any post-session stitching.

- **Segment File + Offline Stitch:** Alternatively, record each session to its own WAV file and stitch them in a post-processing step using the Web Audio `OfflineAudioContext`. Load both buffers, apply a fade-out/fade-in envelope at the join point, and render to a final file. More flexible for editing but requires keeping N session files on disk.

- **IndexedDB Chunk Buffer:** For stability on long sessions, write PCM chunks to IndexedDB as they arrive rather than accumulating them in memory. On session end, read them back out in order for WAV encoding. Prevents OOM crashes and survives brief tab backgrounding.

### UX for Long Sessions

- **Session Health Indicator:** Show the user a countdown or visual indicator (e.g., a shrinking arc) of how much time remains in the current session so transitions feel intentional, not surprising.
- **Manual Handoff Trigger:** Give the user a "New Session" button that fires the crossfade on demand — useful if they want a harder stylistic break at a specific moment.
- **Handoff History Log:** Add each session handoff to the prompt-change log (already planned) with a timestamp, so the full mix is reproducible segment by segment.

## Session Management & Reproducibility

### Performance Logging (Implemented)
- **Server-Side Trace:** All prompt changes, setting updates, and session lifecycle events are automatically sent to the local dev server and appended to `logs/performance.jsonl`. This creates a permanent, machine-readable record of every performance.
- **Export Session Script:** Future ability to export these JSONL logs into a clean, standalone session manifest that can be "re-played" through the model to recreate a specific mix.
- **Session ID:** Generate a unique session ID for every performance to correlate audio files with their prompt logs.
