import { useRef, useState } from 'react';
import { validateAudio } from '../../lib/validators';
import type { Strings } from '../../i18n';

interface AudioTabProps {
  file: File | null;
  onFile: (f: File | null) => void;
  error: string | null;
  onError: (e: string | null) => void;
  t: Strings;
}

export default function AudioTab({ file, onFile, error, onError, t }: AudioTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (f: File) => {
    const err = validateAudio(f);
    if (err) {
      onError(err);
      onFile(null);
      setAudioUrl(null);
      return;
    }
    onError(null);
    onFile(f);
    setAudioUrl(URL.createObjectURL(f));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleRemove = () => {
    onFile(null);
    onError(null);
    setAudioUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/webm,.m4a"
        className="hidden"
        onChange={handleFileChange}
      />

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
            dragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : 'border-slate-300 dark:border-[#2b5997] bg-slate-50 dark:bg-[#071324] hover:border-blue-400'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Upload Suspicious Call Audio
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Drag &amp; drop or click to select call recording
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              MP3, WAV, OGG, M4A, WEBM (Max 10 MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-[#1b3a63] bg-slate-50 dark:bg-[#071324] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">🎵</span>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="min-h-[36px] px-3 py-1 rounded-lg border border-red-300 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              {t.input.removeFile}
            </button>
          </div>

          {audioUrl && (
            <audio
              controls
              src={audioUrl}
              className="w-full h-10"
              aria-label="Uploaded audio call playback"
            />
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
