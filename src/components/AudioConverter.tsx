import { useState, useRef, useCallback } from "react";
import { Upload, Download, Play, Pause, RotateCcw, Waves, Zap } from "lucide-react";
import { AudioFile, ConversionSettings } from "../types/audio";
import { processAudioTo432Hz } from "../utils/audioProcessor";

export function AudioConverter() {
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    targetFrequency: 432,
    quality: "high",
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioFile({
      name: file.name,
      size: file.size,
      duration: 0,
      url,
    });
    setConvertedUrl(null);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      const url = URL.createObjectURL(file);
      setAudioFile({
        name: file.name,
        size: file.size,
        duration: 0,
        url,
      });
      setConvertedUrl(null);
    }
  }, []);

  const handleConvert = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    try {
      const convertedBlob = await processAudioTo432Hz(audioFile.url, settings);
      const url = URL.createObjectURL(convertedBlob);
      setConvertedUrl(url);
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayback = (url: string) => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.src = url;
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetAll = () => {
    setAudioFile(null);
    setConvertedUrl(null);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Main Card */}
      <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 border border-slate-800">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            432 Hz Audio Converter
          </h1>
          <p className="text-slate-400">
            حوّل ملفاتك الصوتية إلى تردد 432 هرتز الشافي
          </p>
        </div>

        {/* Drop Zone */}
        {!audioFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all duration-300 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-xl mb-4 group-hover:bg-indigo-500/20 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <p className="text-white font-medium mb-2">
              اسحب ملف صوتي هنا أو اضغط للاختيار
            </p>
            <p className="text-slate-500 text-sm">
              يدعم MP3, WAV, OGG, FLAC ومزيد
            </p>
          </div>
        ) : (
          /* Audio Info & Controls */
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {audioFile.name}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {formatFileSize(audioFile.size)}
                  </p>
                </div>
                <button
                  onClick={resetAll}
                  className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-5 h-5 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <h3 className="text-white font-medium mb-4">إعدادات التحويل</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">
                    التردد المستهدف
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={settings.targetFrequency}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          targetFrequency: parseInt(e.target.value) || 432,
                        })
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <span className="text-slate-400">Hz</span>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">
                    الجودة
                  </label>
                  <select
                    value={settings.quality}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quality: e.target.value as "low" | "medium" | "high",
                      })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="low">سريعة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحويل...
                </>
              ) : (
                <>
                  <Waves className="w-5 h-5" />
                  تحويل إلى {settings.targetFrequency} Hz
                </>
              )}
            </button>

            {/* Converted Audio Player */}
            {convertedUrl && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 font-medium">
                    تم التحويل بنجاح!
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePlayback(convertedUrl)}
                    className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 rounded-xl flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                    </div>
                  </div>
                  <a
                    href={convertedUrl}
                    download={`converted_${audioFile.name}`}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-3 rounded-xl transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    تحميل
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}