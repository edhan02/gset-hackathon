import { useRef, useState, useCallback } from 'react';
import { validateImage } from '../../lib/validators';
import type { Strings } from '../../i18n';

interface ImageTabProps {
  file: File | null;
  onFile: (f: File | null) => void;
  error: string | null;
  onError: (e: string | null) => void;
  t: Strings;
}

export default function ImageTab({ file, onFile, error, onError, t }: ImageTabProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const processFile = useCallback(
    (f: File) => {
      const err = validateImage(f);
      if (err) {
        onError(err);
        onFile(null);
        setPreviewUrl(null);
        return;
      }
      onError(null);
      onFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    },
    [onError, onFile],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const f = new File([blob], 'screenshot.png', { type: imageType });
          processFile(f);
          return;
        }
      }
    } catch {
      // Clipboard read not permitted or no image
    }
  };

  const handleRemove = () => {
    onFile(null);
    onError(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer
            ${dragging
              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-teal-400 dark:hover:border-teal-500'}
          `}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload screenshot by clicking or dragging"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        >
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t.input.dropPrompt}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, WEBP · max 5 MB</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Screenshot preview"
              className="w-full max-h-56 object-contain bg-gray-100 dark:bg-gray-900"
            />
          )}
          <div className="p-2 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[80%]">
              {t.input.fileSelected}: {file.name}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
              aria-label={t.input.removeFile}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400" role="alert">{error}</p>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleChange}
          aria-label="Choose screenshot file"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          {t.input.chooseFile}
        </button>
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          {t.input.pasteBtn}
        </button>
      </div>
    </div>
  );
}
