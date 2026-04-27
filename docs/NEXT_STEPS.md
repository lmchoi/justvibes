# Next Steps & Technical Roadmap

## 1. Documentation: The "Infinite DJ" Workflow
Based on our research, the most reliable and low-effort way to generate an hour-long mix is the **"Clip to DJ Deck"** pipeline:

1.  **Vibe Check (Lyria 3 Clip):** The user provides an image or text prompt. The app calls the Clip API to quickly generate a 30-second preview.
2.  **Go Live (Lyria Realtime):** Once a clip is "Liked", the app sends that exact 30-second audio chunk to the Realtime API as an `AudioPrompt` (seed).
3.  **Drive the Set:** The user seamlessly transitions between vibes by adjusting text prompts and weights on the fly. The app continuously records the master stereo output to a WebM file, manually saving 10-minute blocks that share the same BPM and stylistic continuity.

## 2. Implementation Plan

*   **Phase 2 (Complete):** Build the "Vibe Check" UI. `vibe-check-panel` component calls `lyria-3-clip-preview` and returns a 30-second playable clip.
*   **Phase 3:** Build the "Seed" functionality. Wire the "Seed Session →" stub button to pass the 30s clip as an `AudioPrompt` to `lyria-realtime-exp`.
*   **Phase 4:** Automated Session Switching. Detect the 10-minute timeout, start a new background session seeded from the previous one, and crossfade.

## 3. Code Quality Backlog

### 3a. Test Infrastructure (do first — guards the refactor)
Add **Vitest + happy-dom** and write component tests for `vibe-check-panel`:
- State transitions: idle → generating → ready / error
- Button disabled when textarea is empty
- Audio element appears on successful generation
- Error message appears on API failure
- Blob URL is revoked on disconnect

### 3b. Component Split Refactor (do after tests are green)
Split `index.tsx` (single monolith) into one file per component under `src/components/`:
- `weight-slider.ts`
- `prompt-controller.ts`
- `settings-controller.ts`
- `vibe-check-panel.ts`
- `vibe-check-button.ts`
- `playback-buttons.ts` (play-pause, reset, add-prompt)
- `toast-message.ts`
- `prompt-dj.ts` (top-level app component)
- `main.ts` (entry point — calls `main()`)

Styles stay co-located with each component (Lit's scoped-CSS pattern). No behaviour changes.