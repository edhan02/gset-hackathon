import { useTheme } from '../hooks/useTheme';
import { Link, useLocation } from 'react-router-dom';

function ShieldEmblemIcon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {/* Central Star / Dharma Wheel hint */}
      <circle cx="12" cy="11" r="3" strokeWidth="1.5" />
      <path d="M12 8v6M9 11h6" strokeWidth="1.5" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function TopBar() {
  const [theme, toggleTheme] = useTheme();
  const location = useLocation();
  const isOfficerRoute = location.pathname.startsWith('/officer');

  return (
    <header className="sticky top-0 z-50 bg-[#0c1f38] text-white shadow-md border-b border-[#1b3a63]">
      {/* 1. Indian National Security & Tricolor Ribbon */}
      <div className="h-1 w-full flex" aria-hidden="true">
        <div className="h-full flex-1 bg-[#FF9933]" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-[#138808]" />
      </div>

      {/* 2. Official National Emergency Hotline Ribbon */}
      <div className="bg-[#071324] text-[11px] font-medium tracking-wide border-b border-[#162f52] px-4 py-1 text-slate-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400 tracking-wider">
              GOVERNMENT OF INDIA
            </span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline text-slate-400">
              Ministry of Home Affairs | Indian Cyber Crime Coordination Centre (I4C)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold ml-auto">
            <a
              href="tel:1930"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              CYBER HELPLINE: 1930
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white hidden sm:inline transition-colors"
            >
              cybercrime.gov.in
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand & Crest */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1d4ed8] to-[#0f2d59] border border-[#3b82f6]/40 flex items-center justify-center text-amber-400 shadow-inner group-hover:border-amber-400 transition-colors">
            <ShieldEmblemIcon className="w-6 h-6" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-wider text-white font-sans">
                CYBER FRAUD SHIELD
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Official
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium tracking-wide">
              Digital Arrest &amp; Coercion Extortion Threat Detection System
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Officer Command Portal Button */}
          <Link
            to="/officer"
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all border shadow-sm ${
              isOfficerRoute
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/20'
                : 'bg-[#15325b] hover:bg-[#1d437a] text-amber-300 border-[#2b5997]'
            }`}
          >
            <svg
              className="w-4 h-4 text-amber-400"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.5 1.1 2.5 2.5S13.4 12 12 12s-2.5-1.1-2.5-2.5S10.6 7 12 7zm0 10.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            <span>Law Enforcement Portal</span>
          </Link>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            aria-label="Toggle dark/light mode"
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#2b5997] bg-[#15325b] text-slate-300 hover:text-white hover:bg-[#1d437a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-4 h-4 text-amber-400" />
            ) : (
              <MoonIcon className="w-4 h-4 text-slate-200" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
