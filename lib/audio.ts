// --- Audio Encoding/Decoding Utilities for Gemini Live API ---
import type { Blob } from '@google/genai';

/**
 * Encodes an array of bytes into a base64 string.
 * This is required to send audio data to the Gemini API.
 * @param bytes The raw audio data as a Uint8Array.
 * @returns A base64 encoded string.
 */
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a base64 string into an array of bytes.
 * This is required to process audio data received from the Gemini API.
 * @param base64 The base64 encoded audio string.
 * @returns The raw audio data as a Uint8Array.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer that can be played by the browser.
 * The Gemini Live API returns audio in this raw format.
 * @param data The raw audio data as a Uint8Array.
 * @param ctx The AudioContext to use for creating the buffer.
 * @param sampleRate The sample rate of the audio (e.g., 24000 for Gemini).
 * @param numChannels The number of audio channels (e.g., 1 for mono).
 * @returns A promise that resolves to an AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Creates a Gemini API Blob from raw audio data.
 * @param data The audio data as a Float32Array (from ScriptProcessorNode).
 * @returns A Blob object for the Gemini API.
 */
export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Convert Float32 to Int16
    int16[i] = data[i] < 0 ? data[i] * 32768 : data[i] * 32767;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

/**
 * Resamples a Float32Array of audio data from a source sample rate to a target sample rate.
 * Uses simple linear interpolation for resampling.
 * @param audioData The raw audio data as a Float32Array.
 * @param fromSampleRate The original sample rate of the audio data.
 * @param toSampleRate The target sample rate for the audio data.
 * @returns The resampled audio data as a Float32Array.
 */
export function resample(audioData: Float32Array, fromSampleRate: number, toSampleRate: number): Float32Array {
  if (fromSampleRate === toSampleRate) {
    return audioData;
  }

  const ratio = fromSampleRate / toSampleRate;
  const newLength = Math.ceil(audioData.length / ratio);
  const resampledData = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const bufferIndex = i * ratio;
    const lowerIndex = Math.floor(bufferIndex);
    const upperIndex = Math.ceil(bufferIndex);

    // Guard against out-of-bounds access at the end of the buffer
    if (upperIndex >= audioData.length) {
      resampledData[i] = audioData[lowerIndex];
      continue;
    }

    const weight = bufferIndex - lowerIndex;
    // Linear interpolation
    resampledData[i] = (1 - weight) * audioData[lowerIndex] + weight * audioData[upperIndex];
  }

  return resampledData;
}


/**
 * Plays a short beep sound using the Web Audio API.
 * @param frequency The frequency of the beep in Hz.
 * @param duration The duration of the beep in seconds.
 * @param volume The volume of the beep (0.0 to 1.0).
 */
export function playBeep(frequency = 440, duration = 0.1, volume = 0.1) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    // Close the context after the sound has played to free up resources.
    setTimeout(() => {
        audioContext.close();
    }, (duration * 1000) + 50);
  } catch (e) {
    console.error("Could not play beep sound:", e);
  }
}
