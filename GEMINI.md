# Gemini Project Context: PromptDJ

This file provides foundational context and mandates for all Gemini agents working on this project.

## Project Mission
To transform this real-time music "steering" demo into a professional **Infinite DJ** tool capable of generating and recording seamless, automated 1-hour mixes.

## Technical Stack & Constraints
- **Framework:** Lit (Web Components), TypeScript, Vite.
- **AI Model:** `lyria-realtime-exp` (via Gemini API `v1alpha`).
- **Session Limit:** Experimental sessions are currently capped at **10 minutes**.
- **Audio Pipeline:** Audio is decoded from PCM chunks and played via `AudioContext`. Recording and Bookmarking are implemented using `MediaRecorder` connected to a `MediaStreamAudioDestinationNode`.
- **Environment Variables:** Always use the `VITE_GEMINI_API_KEY` prefix for browser access.

## Coding & Architectural Standards
- **Atomic Commits:** Prefer small, reviewable commits over large "monolith" changes.
- **Commit Style:** Use Conventional Commits (e.g., `feat:`, `fix:`, `docs:`). Do NOT use "Step XX" prefixes.
- **Commit Attribution:** Always append `Co-Authored-By: Gemini 2.0 Flash <noreply@google.com>` to the end of commit messages.
- **Efficiency:** Prioritize the "Manual Record -> Clip Preview -> Seed Session" workflow to minimize token waste and human effort.

## Current Roadmap
1.  **Phase 1 (Complete):** Manual Recording and Bookmarking (Heart button).
2.  **Phase 2:** Implement "Vibe Check" UI using `lyria-3-clip-preview` for 30s snippets.
3.  **Phase 3:** Implement "Seed" functionality to launch Realtime sessions from saved clips.
4.  **Phase 4:** Automated Session Management (stitching 10-minute blocks into a 1-hour mix).

## Key Documentation
Refer to the `docs/` directory for detailed PRDs and Lyria API references.
