import {vi} from 'vitest';

// happy-dom's localStorage doesn't fully implement the Storage interface.
const store: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  },
  writable: true,
});

// AudioContext is not available in happy-dom.
(window as unknown as Record<string, unknown>).AudioContext = vi.fn(
  function () {
    return {
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: {setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn()},
      })),
      createBufferSource: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
      })),
      destination: {},
      currentTime: 0,
      resume: vi.fn().mockResolvedValue(undefined),
    };
  },
);
