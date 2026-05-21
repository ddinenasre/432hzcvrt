export interface AudioFile {
  name: string;
  size: number;
  duration: number;
  url: string;
}

export interface ConversionSettings {
  targetFrequency: number;
  quality: "low" | "medium" | "high";
}