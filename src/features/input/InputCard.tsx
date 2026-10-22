import { useState, useCallback, useRef } from 'react';
import { isBackendConfigured } from '../../api/client';
import { validateText, validateImage, validateAudio } from '../../lib/validators';
import TextTab from './TextTab';
import ImageTab from './ImageTab';
import AudioTab from './AudioTab';
import type { InputTab } from '../../types';
import type { Strings } from '../../i18n';

interface InputCardProps {
  onSubmit: (
    input:
      | { type: 'text'; value: string }
      | { type: 'image'; file: File }
      | { type: 'audio'; file: File },
  ) => void;
  disabled?: boolean;
  t: Strings;
}

const TABS: { id: InputTab; label: string; icon: string }[] = [
  { id: 'text', label: 'Suspicious Message / Notice', icon: '📝' },
  { id: 'image', label: 'Chat Screenshot / Letter', icon: '🖼️' },
  { id: 'audio', label: 'Threat Call Audio File', icon: '🎧' },
];

export default function InputCard({ onSubmit, disabled = false, t }: InputCardProps) {
  const [activeTab, setActiveTab] = useState<InputTab>('text');
  const [textValue, setTextValue] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  const backendOk = isBackendConfigured();

  const handleTabKeyDown = (e: React.KeyboardEvent, currentIdx: number) => {
    let nextIdx = currentIdx;
    if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + TABS.length) % TABS.length;
    else return;
    e.preventDefault();
    setActiveTab(TABS[nextIdx].id);
    const buttons = tabListRef.current?.querySelectorAll('[role="tab"]');
    (buttons?.[nextIdx] as HTMLElement)?.focus();
  };

  const canSubmit = useCallback((): boolean => {
    if (!backendOk) return false;
    if (disabled) return false;
    if (activeTab === 'text') return validateText(textValue) === null;
    if (activeTab === 'image') return imageFile !== null && validateImage(imageFile) === null;
    if (activeTab === 'audio') return audioFile !== null && validateAudio(audioFile) === null;
    return false;
  }, [activeTab, textValue, imageFile, audioFile, disabled, backendOk]);

  const handleSubmit = () => {
    if (!canSubmit()) return;
    if (activeTab === 'text') onSubmit({ type: 'text', value: textValue });
    else if (activeTab === 'image' && imageFile) onSubmit({ type: 'image', file: imageFile });
    else if (activeTab === 'audio' && audioFile) onSubmit({ type: 'audio', file: audioFile });
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#0c1f38] border-2 border-slate-200 dark:border-[#1b3a63] shadow-md overflow-hidden">
      {/* Backend not configured alert */}
      {!backendOk && (
        <div
          role="alert"
          className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 flex items-start gap-2.5 text-amber-800 dark:text-amber-300"
        >
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wide">Analysis Engine Not Configured</p>
            <p className="opacity-90">Please set <code className="font-mono font-bold">VITE_N8N_WEBHOOK_URL</code> in your <code className="font-mono">.env</code> file to enable live cybercrime detection.</p>
          </div>
        </div>
      )}

      {/* Institutional Tab Bar */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Input format selector"
        className="flex border-b border-slate-200 dark:border-[#1b3a63] bg-slate-50 dark:bg-[#071324]"
      >
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`
                flex-1 py-3.5 px-3 text-xs sm:text-sm font-bold tracking-wide transition-all border-b-2 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400
                ${
                  isActive
                    ? 'border-blue-600 dark:border-amber-400 text-blue-700 dark:text-amber-300 bg-white dark:bg-[#0c1f38] shadow-sm'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-6">
        <div
          id="panel-text"
          role="tabpanel"
          aria-labelledby="tab-text"
          hidden={activeTab !== 'text'}
        >
          {activeTab === 'text' && (
            <TextTab value={textValue} onChange={setTextValue} t={t} />
          )}
        </div>

        <div
          id="panel-image"
          role="tabpanel"
          aria-labelledby="tab-image"
          hidden={activeTab !== 'image'}
        >
          {activeTab === 'image' && (
            <ImageTab
              file={imageFile}
              onFile={setImageFile}
              error={imageError}
              onError={setImageError}
              t={t}
            />
          )}
        </div>

        <div
          id="panel-audio"
          role="tabpanel"
          aria-labelledby="tab-audio"
          hidden={activeTab !== 'audio'}
        >
          {activeTab === 'audio' && (
            <AudioTab
              file={audioFile}
              onFile={setAudioFile}
              error={audioError}
              onError={setAudioError}
              t={t}
            />
          )}
        </div>

        {/* Action Button & Privacy Note */}
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="w-full min-h-[48px] rounded-lg bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 hover:from-blue-600 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:cursor-not-allowed text-white disabled:text-slate-500 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-amber-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>Scan for Digital Arrest &amp; Fraud Patterns</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            <span>Confidential Citizen Safety Scan · Automated Threat Assessment (10–30s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
