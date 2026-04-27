import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import type {VibeCheckPanel} from '../index.tsx';

// vi.hoisted ensures these are available inside the vi.mock factory below.
const {mockGenerateContent, mockConnect} = vi.hoisted(() => {
  const mockSession = {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    setWeightedPrompts: vi.fn().mockResolvedValue(undefined),
    setMusicGenerationConfig: vi.fn().mockResolvedValue(undefined),
    resetContext: vi.fn(),
  };
  return {
    mockGenerateContent: vi.fn(),
    mockConnect: vi.fn().mockResolvedValue(mockSession),
  };
});

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(function () {
    return {
      models: {generateContent: mockGenerateContent},
      live: {music: {connect: mockConnect}},
    };
  }),
}));

// Import after mock is registered — registers all custom elements as a side effect.
await import('../index.tsx');

// Minimal valid response with a fake base64 MP3 payload.
function makeAudioResponse(base64 = btoa('fake-mp3')) {
  return {
    candidates: [
      {
        content: {
          parts: [{inlineData: {data: base64, mimeType: 'audio/mpeg'}}],
        },
      },
    ],
  };
}

async function createElement() {
  const el = document.createElement('vibe-check-panel') as VibeCheckPanel;
  el.visible = true;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('vibe-check-panel', () => {
  let el: VibeCheckPanel;

  beforeEach(async () => {
    el = await createElement();
  });

  afterEach(() => {
    el.remove();
    mockGenerateContent.mockReset();
  });

  it('renders textarea and generate button', () => {
    expect(el.shadowRoot!.querySelector('textarea')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.generate-btn')).toBeTruthy();
  });

  it('generate button is disabled when textarea is empty', () => {
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>('.generate-btn')!;
    expect(btn.disabled).toBe(true);
  });

  it('generate button is enabled after typing text', async () => {
    const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('textarea')!;
    textarea.value = 'dark hypnotic techno';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>('.generate-btn')!;
    expect(btn.disabled).toBe(false);
  });

  it('shows spinner while generating', async () => {
    // Delay resolution so we can observe the generating state.
    let resolve!: (v: unknown) => void;
    mockGenerateContent.mockReturnValueOnce(new Promise((r) => (resolve = r)));

    const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('textarea')!;
    textarea.value = 'vibe';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    el.shadowRoot!.querySelector<HTMLButtonElement>('.generate-btn')!.click();
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.spinner')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('audio')).toBeFalsy();

    // Clean up the dangling promise.
    resolve(makeAudioResponse());
  });

  it('shows audio player and seed button after successful generation', async () => {
    mockGenerateContent.mockResolvedValueOnce(makeAudioResponse());

    const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('textarea')!;
    textarea.value = 'vibe';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    el.shadowRoot!.querySelector<HTMLButtonElement>('.generate-btn')!.click();

    // Wait for the async handleGenerate to finish then re-render.
    await mockGenerateContent.mock.results[0].value;
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('audio')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.seed-btn')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.spinner')).toBeFalsy();
  });

  it('shows error message when generation fails', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('quota exceeded'));

    const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('textarea')!;
    textarea.value = 'vibe';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    el.shadowRoot!.querySelector<HTMLButtonElement>('.generate-btn')!.click();

    await mockGenerateContent.mock.results[0].value.catch(() => {});
    await el.updateComplete;

    const errEl = el.shadowRoot!.querySelector('.error');
    expect(errEl).toBeTruthy();
    expect(errEl!.textContent).toContain('quota exceeded');
    expect(el.shadowRoot!.querySelector('audio')).toBeFalsy();
  });

  it('Enter key triggers generation', async () => {
    mockGenerateContent.mockResolvedValueOnce(makeAudioResponse());

    const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('textarea')!;
    textarea.value = 'vibe';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    await el.updateComplete;

    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it('Shift+Enter does not trigger generation', async () => {
    const textarea = el.shadowRoot!.querySelector<HTMLTextAreaElement>('textarea')!;
    textarea.value = 'vibe';
    textarea.dispatchEvent(new Event('input'));
    await el.updateComplete;

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Enter', shiftKey: true, bubbles: true}),
    );
    await el.updateComplete;

    expect(mockGenerateContent).not.toHaveBeenCalled();
  });
});
