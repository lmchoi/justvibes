# Product Requirements Document (PRD): Session Recording

## 1. Objective
Enable users to capture and download their live, real-time generative music sessions (powered by `lyria-realtime-exp`) as a single audio file. This is the first step toward the long-term goal of generating automated, hour-long DJ mixes.

## 2. Scope (Phase 1: Keep It Simple)
We will focus on a **Manual Recording** workflow. The user will manually start and stop a recording of their live performance while they adjust prompt weights. The output will be a single, complete audio track representing their session.

## 3. User Experience (UX) Flow
1.  **Placement:** A new "Record" button is added to the `.playback-container` (next to Play/Pause and Reset).
2.  **Start Recording:** The user clicks the Record button. 
    *   The button visually changes state (e.g., icon changes to a "Stop" square, color turns red) to clearly indicate that recording is active.
3.  **The Performance:** The user manipulates the prompt sliders. The model generates audio continuously.
4.  **Stop & Save:** The user clicks the Record button again to stop.
    *   The application immediately processes the captured audio.
    *   The browser automatically triggers a file download dialog (e.g., `promptdj-session-123456.webm`).
    *   The button returns to its default state.

## 4. Technical Strategy

To ensure high quality and minimal human effort, we will use the browser's native `MediaRecorder` API connected directly to the application's audio pipeline.

*   **Audio Routing:** We will create a `MediaStreamAudioDestinationNode` from the existing `AudioContext`.
*   **Connection:** We will connect the main `outputNode` (the `GainNode` that currently feeds the speakers) to this new destination node.
*   **Capture:** We will initialize a `MediaRecorder` instance pointing to the destination node's stream.
*   **Format:** The `MediaRecorder` will be configured to record in the browser's native, highly compressed format (typically `audio/webm;codecs=opus`). This requires no external libraries and produces small, high-quality files perfect for hour-long sessions.
*   **Assembly:** As the `MediaRecorder` emits `dataavailable` events, the chunks are stored in an array. On `stop`, the array is converted into a `Blob` and a temporary hidden `<a>` tag is used to trigger the browser's download prompt.

*Alternative Considered:* Capturing raw PCM chunks directly from the WebSocket. While this avoids potential local browser playback stutters, it requires manually writing WAV headers (resulting in massive files for a 1-hour session) or importing heavy third-party libraries to encode MP3s in the browser. `MediaRecorder` + WebM is the simplest, most robust web-native solution.

## 5. Future Considerations (Phase 2 & Beyond)
This simple manual recording foundation paves the way for the automated "12-track DJ Mix":
*   **Automated setlists:** Using an LLM to expand a single user prompt ("ambient to techno") into a JSON array of 12 distinct track prompts.
*   **Scripted Transitions:** Writing logic to automatically crossfade the weights between those 12 prompts over a 60-minute loop, while the `MediaRecorder` runs silently in the background, automatically downloading the final 1-hour epic mix with zero human intervention.
*   **Reference Tracks:** Allowing the user to upload a track to seed the `lyria-realtime-exp` session before the automated hour begins.