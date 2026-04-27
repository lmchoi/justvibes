# Next Steps & Technical Roadmap

## 1. Documentation: The "Infinite DJ" Workflow
Based on our research, the most reliable and low-effort way to generate an hour-long mix is the **"Clip to DJ Deck"** pipeline:

1.  **Vibe Check (Lyria 3 Clip):** The user provides an image or text prompt. The app calls the Clip API to quickly generate a 30-second preview.
2.  **Go Live (Lyria Realtime):** Once a clip is "Liked", the app sends that exact 30-second audio chunk to the Realtime API as an `AudioPrompt` (seed).
3.  **Drive the Set:** The user seamlessly transitions between vibes by adjusting text prompts and weights on the fly. The app continuously records the master stereo output to a WebM file, manually saving 10-minute blocks that share the same BPM and stylistic continuity.

## 2. Implementation Plan (Phase 2 & 3)

*   **Phase 2:** Build the "Vibe Check" UI. Add an image/text input area that calls the `lyria-3-clip-preview` model and returns a 30-second playable snippet.
*   **Phase 3:** Build the "Seed" functionality. Add a button to transfer a generated 30-second clip into the `lyria-realtime-exp` session to start the live DJ set.
*   **Phase 4:** Automated Session Switching. Implement logic to detect the 10-minute timeout, start a new background session with an `AudioPrompt` from the previous session, and crossfade between them to reach the 1-hour goal.