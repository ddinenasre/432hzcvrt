import { ConversionSettings } from "../types/audio";

export async function processAudioTo432Hz(
  audioUrl: string,
  settings: ConversionSettings
): Promise<Blob> {
  const audioContext = new (window.AudioContext ||
    (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const sampleRate = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  
  // Calculate playback rate for frequency conversion
  // Standard tuning is 440 Hz, convert to target (default 432 Hz)
  const playbackRate = settings.targetFrequency / 440;
  
  // Create offline context for rendering
  const offlineContext = new OfflineAudioContext(
    channels,
    Math.ceil(length / playbackRate),
    sampleRate
  );
  
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = playbackRate;
  source.connect(offlineContext.destination);
  source.start(0);
  
  const renderedBuffer = await offlineContext.startRendering();
  
  // Convert AudioBuffer to WAV blob
  const wavBlob = audioBufferToWav(renderedBuffer);
  
  audioContext.close();
  
  return wavBlob;
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const data: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    data.push(buffer.getChannelData(i));
  }
  
  const samples = data[0].length;
  const dataSize = samples * blockAlign;
  const bufferSize = 44 + dataSize;
  
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);
  
  // Write WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);
  
  // Write audio data
  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, data[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}