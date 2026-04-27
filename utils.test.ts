import {describe, it, expect} from 'vitest';
import {encodeWav} from './utils';

describe('encodeWav', () => {
  const sampleRate = 48000;
  const numChannels = 2;

  function view(pcm: Uint8Array) {
    return new DataView(encodeWav(pcm, sampleRate, numChannels));
  }

  function str(dv: DataView, offset: number, len: number) {
    return Array.from({length: len}, (_, i) =>
      String.fromCharCode(dv.getUint8(offset + i)),
    ).join('');
  }

  it('produces a buffer of 44 + pcm.length bytes', () => {
    const pcm = new Uint8Array(200);
    expect(encodeWav(pcm, sampleRate, numChannels).byteLength).toBe(244);
  });

  it('writes RIFF/WAVE headers', () => {
    const dv = view(new Uint8Array(0));
    expect(str(dv, 0, 4)).toBe('RIFF');
    expect(str(dv, 8, 4)).toBe('WAVE');
    expect(str(dv, 12, 4)).toBe('fmt ');
    expect(str(dv, 36, 4)).toBe('data');
  });

  it('sets RIFF chunk size to 36 + pcm.length', () => {
    const pcm = new Uint8Array(100);
    const dv = view(pcm);
    expect(dv.getUint32(4, true)).toBe(136);
  });

  it('writes correct fmt chunk values', () => {
    const dv = view(new Uint8Array(0));
    expect(dv.getUint32(16, true)).toBe(16);   // fmt chunk size
    expect(dv.getUint16(20, true)).toBe(1);    // PCM format
    expect(dv.getUint16(22, true)).toBe(2);    // channels
    expect(dv.getUint32(24, true)).toBe(48000); // sample rate
    expect(dv.getUint32(28, true)).toBe(192000); // byte rate: 48000 * 2 * 16/8
    expect(dv.getUint16(32, true)).toBe(4);    // block align: 2 * 16/8
    expect(dv.getUint16(34, true)).toBe(16);   // bits per sample
  });

  it('sets data chunk size to pcm.length', () => {
    const pcm = new Uint8Array(80);
    const dv = view(pcm);
    expect(dv.getUint32(40, true)).toBe(80);
  });

  it('copies pcm bytes verbatim after the 44-byte header', () => {
    const pcm = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const out = new Uint8Array(encodeWav(pcm, sampleRate, numChannels));
    expect(Array.from(out.slice(44))).toEqual([0x01, 0x02, 0x03, 0x04]);
  });

  it('correctly encodes multiple concatenated chunks', () => {
    const chunk1 = new Uint8Array([0x01, 0x02]);
    const chunk2 = new Uint8Array([0x03, 0x04]);
    const combined = new Uint8Array(4);
    combined.set(chunk1, 0);
    combined.set(chunk2, 2);
    const out = new Uint8Array(encodeWav(combined, sampleRate, numChannels));
    expect(Array.from(out.slice(44))).toEqual([0x01, 0x02, 0x03, 0x04]);
    expect(new DataView(out.buffer).getUint32(40, true)).toBe(4);
  });

  it('handles empty pcm', () => {
    const buf = encodeWav(new Uint8Array(0), sampleRate, numChannels);
    expect(buf.byteLength).toBe(44);
    const dv = new DataView(buf);
    expect(dv.getUint32(4, true)).toBe(36);
    expect(dv.getUint32(40, true)).toBe(0);
  });
});
