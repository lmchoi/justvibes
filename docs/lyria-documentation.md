# Lyria RealTime (`lyria-realtime-exp`) Documentation Reference

This document serves as a reference for understanding how the experimental generative music model handles real-time audio streaming, token usage, and transitions.

## Key Concepts

*   **Continuous Streaming:** The model generates audio in contiguous chunks (typically 2-second blocks). It uses a sliding context window (approximately 10 seconds) to ensure that new audio seamlessly bridges the gap between past and future inputs.
*   **Latency vs. Buffer:** Changes to prompt weights take approximately **2 seconds** to be reflected in the audio output. This is largely due to the browser's `AudioContext` buffering (`bufferTime = 2` in `index.tsx`), which intentionally queues audio to prevent stuttering from network latency.
*   **Seamless Acoustic Transitions (Morphing):** As you adjust sliders (prompt weights), the model reconciles the new inputs with the immediate musical history. It generates a logical, musically coherent transition (a blend) rather than an abrupt, jarring cut.
*   **Token Usage:** Because the connection is a persistent, bidirectional WebSocket, the model continuously consumes tokens for both the input (prompts/weights) and the 48kHz audio stream output while the state is `playing`.
    *   *Optimization:* Use the "Pause" button to suspend the session and stop token consumption when not actively mixing.

## API & Parameter Steering

The model supports granular control via the `MusicGenerationConfig` and `WeightedPrompt` messages:
*   **`WeightedPrompt`:** Allows multi-prompt blending. Adjusting the weight acts like a fader.
*   **Density & Brightness:** Real-time structural controls for note onset ("busyness") and tonal quality.
*   **Hard Transitions:** Drastic, instantaneous changes to structural parameters like **BPM (tempo)** or **Musical Key/Scale** are the primary actions that may cause a momentary "jump" or hard transition in the audio.

## External Resources and Documentation

While official, stable documentation for the `-exp` (experimental) model is actively evolving, the following resources outline the architecture and capabilities of the Lyria real-time API:

*   **[Google DeepMind: Lyria Overview](https://deepmind.google/discover/blog/transforming-the-future-of-music-creation/)**: Foundational overview of the Lyria architecture and its focus on high-quality, instrumental music generation.
*   **[Google AI for Developers: Audio Generation](https://ai.google.dev/docs/audio_generation)**: Standard AI Studio documentation. Keep an eye here for updates as the `lyria-realtime-exp` model moves toward General Availability.
*   **[Google AI Studio: Prompt Gallery & Cookbooks](https://aistudio.google.com/app/prompts)**: Often contains experimental notebooks and cookbooks demonstrating WebSocket connections for real-time models.

*Note: Because `lyria-realtime-exp` is an experimental model, API signatures and capabilities (like the `guidance` scale or specific enum values) are subject to change.*