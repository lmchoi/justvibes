# Next Steps & Technical Roadmap

## 1. Documentation: The "Infinite DJ" Workflow
Based on our research, the most reliable and low-effort way to generate an hour-long mix is the **"Clip to DJ Deck"** pipeline:

1.  **Vibe Check (Lyria 3 Clip):** The user provides a text prompt. The app calls the Clip API to quickly generate a 30-second preview.
2.  **Go Live (Lyria Realtime):** Once a vibe is selected, the app launches a Realtime session using the same text prompt to ensure stylistic continuity.
3.  **Drive the Set:** The user seamlessly transitions between vibes by adjusting text prompts and weights on the fly. The app continuously records the master stereo output to a WAV file.

## 2. Implementation Plan

*   **Phase 2 (Parked):** Build the "Vibe Check" UI. Add a text input area that calls the `lyria-3-clip-preview` model and returns a 30-second playable snippet. (Postponed: focusing on session continuity first).
*   **Phase 3 (Parked):** Build the "Seed" functionality. Add logic to transfer text prompts from a generated clip into the `lyria-realtime-exp` session. (Postponed: focusing on session continuity first).
*   **Phase 4 (Priority):** Automated Session Switching. Implement logic to detect the 10-minute timeout, start a new background session using the current prompts, and crossfade between them to reach the 1-hour goal.