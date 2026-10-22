import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchReports,
  updateReportStatus,
  isSupabaseConfigured,
  type ScamReportRecord,
} from '../lib/supabase';
import HighlightedText from '../components/HighlightedText';
import EmblemOfIndia from '../components/EmblemOfIndia';

type FilterType = 'all' | 'text' | 'image' | 'audio';
type TabType = 'likely_scammed' | 'all';

const DEMO_BADGE = 'OFFICER-1930';
const DEMO_PASSCODE = 'shield1930';

export default function OfficerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('shield_officer_auth') === 'true';
  });

  // Login form state
  const [badgeId, setBadgeId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data state
  const [reports, setReports] = useState<ScamReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLiveDb, setIsLiveDb] = useState(false);

  // Filter state
  const [currentTab, setCurrentTab] = useState<TabType>('likely_scammed');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected dossier modal
  const [selectedReport, setSelectedReport] = useState<ScamReportRecord | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchReports();
    setReports(res.data);
    setIsLiveDb(res.isLive);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (
      badgeId.trim().toUpperCase() === DEMO_BADGE &&
      passcode.trim() === DEMO_PASSCODE
    ) {
      sessionStorage.setItem('shield_officer_auth', 'true');
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError('Invalid Service Badge ID or Authorization PIN. Please use provided credentials.');
    }
  };

  const handleQuickDemoLogin = () => {
    setBadgeId(DEMO_BADGE);
    setPasscode(DEMO_PASSCODE);
    sessionStorage.setItem('shield_officer_auth', 'true');
    setIsAuthenticated(true);
    setLoginError(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('shield_officer_auth');
    setIsAuthenticated(false);
    setBadgeId('');
    setPasscode('');
  };

  const handleStatusChange = async (id: string, newStatus: ScamReportRecord['status']) => {
    await updateReportStatus(id, newStatus);
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Tab filter: likely_scammed = HIGH risk or score >= 70
      if (currentTab === 'likely_scammed') {
        const isHighThreat = r.risk_level === 'HIGH' || r.risk_score >= 70;
        if (!isHighThreat) return false;
      }

      // Input type filter
      if (filterType !== 'all' && r.input_type !== filterType) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = r.analyzed_text?.toLowerCase().includes(query);
        const scamTypeMatch = r.scam_type?.toLowerCase().includes(query);
        const flagMatch = r.red_flags?.some(
          (f) =>
            f.phrase.toLowerCase().includes(query) ||
            f.category.toLowerCase().includes(query) ||
            f.why.toLowerCase().includes(query),
        );
        if (!textMatch && !scamTypeMatch && !flagMatch) return false;
      }

      return true;
    });
  }, [reports, currentTab, filterType, searchQuery]);

  // Quick stats
  const stats = useMemo(() => {
    const critical = reports.filter((r) => r.risk_level === 'HIGH' || r.risk_score >= 70).length;
    const moderate = reports.filter((r) => r.risk_level === 'MEDIUM').length;
    const total = reports.length;
    const avgScore = total > 0 ? Math.round(reports.reduce((acc, r) => acc + r.risk_score, 0) / total) : 0;
    return { critical, moderate, total, avgScore };
  }, [reports]);

  // ==========================================
  // 1. OFFICIAL POLICE / GOVT LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-[#071324] text-slate-100">
        <div className="w-full max-w-lg rounded-xl bg-[#0c1f38] border-2 border-[#1f4273] shadow-2xl overflow-hidden">
          {/* Top Tricolor Strip */}
          <div className="h-1.5 w-full flex" aria-hidden="true">
            <div className="h-full flex-1 bg-[#FF9933]" />
            <div className="h-full flex-1 bg-white" />
            <div className="h-full flex-1 bg-[#138808]" />
          </div>

          {/* Official Emblem & Header */}
          <div className="p-6 text-center border-b border-[#1b3a63] bg-[#09182d]">
            <EmblemOfIndia size={72} gold className="mx-auto mb-3" />
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
              Government of India · भारत सरकार
            </p>
            <h1 className="text-lg font-black tracking-wide text-white uppercase mt-0.5">
              Ministry of Home Affairs
            </h1>
            <p className="text-xs font-semibold text-slate-300 tracking-wider uppercase mt-0.5">
              Indian Cyber Crime Coordination Centre (I4C)
            </p>
            <div className="mt-3 inline-block px-3 py-1 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] font-bold tracking-widest uppercase">
              Restricted Access · Law Enforcement Command Portal
            </div>
          </div>

          {/* Security Notice */}
          <div className="px-6 py-2.5 bg-red-950/40 border-b border-red-900/40 text-[11px] text-red-300 flex items-center gap-2">
            <span className="font-bold uppercase text-red-400">Notice:</span>
            <span>Authorized access only under Information Technology Act, 2000.</span>
          </div>

          {/* Credentials Form */}
          <div className="p-6 sm:p-8 space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Officer Service / Badge ID
                </label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. OFFICER-1930"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-[#2b5997] bg-[#071324] text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Security Token / Authorization PIN
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-[#2b5997] bg-[#071324] text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-700 text-xs text-red-200">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[46px] rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Verify &amp; Enter Cyber Command
              </button>
            </form>

            {/* Quick Demo Access */}
            <div className="pt-2 border-t border-[#1b3a63]">
              <div className="p-3.5 rounded-lg bg-[#071324] border border-[#1b3a63] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-bold text-amber-400 uppercase tracking-wide">
                    Authorized Demo Credentials
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Badge: <code className="font-mono text-white">OFFICER-1930</code> | PIN: <code className="font-mono text-white">shield1930</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="min-h-[38px] px-4 py-1.5 rounded-md bg-[#1b3a63] hover:bg-[#25508a] border border-[#3b75be] text-xs font-bold uppercase tracking-wider text-white transition-colors"
                >
                  Quick Demo Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. OFFICIAL LAW ENFORCEMENT COMMAND DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#071324] text-slate-900 dark:text-slate-100 py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-5">
        {/* Official Header Banner */}
        <div className="rounded-xl bg-[#0c1f38] text-white border-2 border-[#1b3a63] shadow-lg p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <EmblemOfIndia size={56} gold className="shrink-0" />
              <div className="leading-tight">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    MHA · I4C Central Cyber Cell
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300">
                    Station Code: DL-CC-1930
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white mt-1">
                  Digital Arrest &amp; Cyber Extortion Command Portal
                </h1>
                <p className="text-xs text-slate-300 font-medium tracking-wide">
                  Real-Time Incident Triage · Impersonation Fraud Interception · Victim Protection Unit
                </p>
              </div>
            </div>

            {/* Officer Status & Logout */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Officer In-Charge
                </p>
                <p className="text-[11px] text-slate-300 font-mono">
                  ID: OFFICER-1930 (Cyber Cell)
                </p>
              </div>

              {/* Status pill (No database schema exposed) */}
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                  isLiveDb || isSupabaseConfigured()
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-950/40 text-amber-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLiveDb ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isLiveDb ? 'Central Cloud Sync Active' : 'Station Local Registry Active'}</span>
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                title="Refresh incident feed"
                className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#2b5997] bg-[#15325b] hover:bg-[#1d437a] text-xs font-bold uppercase tracking-wider text-white transition-colors flex items-center gap-1.5"
              >
                <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                Sync
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="min-h-[38px] px-3 py-1.5 rounded-lg border border-red-700/60 bg-red-950/60 hover:bg-red-900/80 text-xs font-bold uppercase tracking-wider text-red-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Threat Metric Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl p-4 bg-white dark:bg-[#0c1f38] border-2 border-red-500/40 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                Critical Danger
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            </div>
            <p className="text-3xl font-black text-red-700 dark:text-red-400 mt-1">
              {stats.critical}
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              Likely Scammed / Active Digital Arrest
            </p>
          </div>

          <div className="rounded-xl p-4 bg-white dark:bg-[#0c1f38] border border-amber-500/40 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Suspicious Intimidation
            </span>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.moderate}
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              Moderate Coercion Flags
            </p>
          </div>

          <div className="rounded-xl p-4 bg-white dark:bg-[#0c1f38] border border-slate-200 dark:border-[#1b3a63] shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Ingested Reports
            </span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.total}
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              Citizen Inputs Logged
            </p>
          </div>

          <div className="rounded-xl p-4 bg-white dark:bg-[#0c1f38] border border-slate-200 dark:border-[#1b3a63] shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Average Threat Index
            </span>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stats.avgScore} <span className="text-base font-semibold text-slate-400">/ 100</span>
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              Composite Risk Severity
            </p>
          </div>
        </div>

        {/* Command Toolbar & Tab Controls */}
        <div className="rounded-xl bg-white dark:bg-[#0c1f38] border border-slate-200 dark:border-[#1b3a63] p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Primary Category Tabs */}
            <div className="flex gap-2 p-1 rounded-lg bg-slate-100 dark:bg-[#071324] border border-slate-200 dark:border-[#1b3a63]">
              <button
                type="button"
                onClick={() => setCurrentTab('likely_scammed')}
                className={`min-h-[38px] px-4 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  currentTab === 'likely_scammed'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>High Threat / Likely Scammed (Priority)</span>
                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-black/20">
                  {stats.critical}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('all')}
                className={`min-h-[38px] px-4 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  currentTab === 'all'
                    ? 'bg-[#1b3a63] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>All Incident Entries</span>
                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-black/20">
                  {stats.total}
                </span>
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by threat phrase, agency (CBI, ED, Police), transcript..."
                className="w-full min-h-[38px] pl-9 pr-3 rounded-lg border border-slate-300 dark:border-[#2b5997] bg-slate-50 dark:bg-[#071324] text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Media Filter Pills */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#162f52] text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Evidence Filter:
            </span>
            {(
              [
                { id: 'all', label: 'All Formats' },
                { id: 'text', label: 'SMS & Text' },
                { id: 'image', label: 'Screenshots / Notices' },
                { id: 'audio', label: 'Recorded Calls' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilterType(item.id)}
                className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                  filterType === item.id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-100 dark:bg-[#071324] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#162f52]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Feed List */}
        {filteredReports.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-[#1b3a63] bg-white dark:bg-[#0c1f38] p-12 text-center">
            <EmblemOfIndia size={48} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              No Incident Records Match Selected Filters
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Citizen reports submitted from the detection shield are registered automatically into the command registry.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const isHigh = report.risk_level === 'HIGH' || report.risk_score >= 70;
              return (
                <div
                  key={report.id}
                  className={`rounded-xl border-2 p-4 sm:p-5 transition-all bg-white dark:bg-[#0c1f38] shadow-sm ${
                    isHigh
                      ? 'border-red-500/60 dark:border-red-500/50 bg-red-50/20 dark:bg-red-950/10'
                      : 'border-slate-200 dark:border-[#1b3a63]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left details */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Threat score pill */}
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                            isHigh
                              ? 'bg-red-600 text-white shadow-sm'
                              : report.risk_level === 'MEDIUM'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {report.risk_level} · {report.risk_score}/100 THREAT
                        </span>

                        {/* Modus Operandi */}
                        <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#1b3a63] text-amber-300 border border-[#2b5997]">
                          {report.scam_type || 'Impersonation Extortion Pattern'}
                        </span>

                        {/* Evidence Type */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-200 dark:bg-[#071324] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#2b5997]">
                          Evidence: {report.input_type}
                        </span>

                        {/* Case Docket ID */}
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          ID: {report.id.slice(0, 8)}...
                        </span>

                        <span className="text-[11px] text-slate-400 tabular-nums ml-auto sm:ml-0">
                          {new Date(report.created_at).toLocaleString()}
                        </span>
                      </div>

                      {/* Transcribed / Extracted Evidence */}
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#162f52] font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed break-words line-clamp-3">
                        {report.analyzed_text || 'No text extracted from upload.'}
                      </div>

                      {/* Flagged Coercion Indicators */}
                      {report.red_flags && report.red_flags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {report.red_flags.map((flag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800/80"
                              title={flag.why}
                            >
                              <span className="font-bold">&ldquo;{flag.phrase}&rdquo;</span>
                              <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">
                                [{flag.category}]
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Action / Status Controls */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-[#1b3a63]">
                      <div className="text-right">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Case Docket Status
                        </label>
                        <select
                          value={report.status || 'PENDING_REVIEW'}
                          onChange={(e) =>
                            handleStatusChange(report.id, e.target.value as ScamReportRecord['status'])
                          }
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-slate-300 dark:border-[#2b5997] bg-white dark:bg-[#071324] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          <option value="PENDING_REVIEW">Pending Triage</option>
                          <option value="ESCALATED_1930">🚨 Helpline 1930 Escalated</option>
                          <option value="INVESTIGATING">Under Active Investigation</option>
                          <option value="RESOLVED">Resolved / Citizen Safe</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="min-h-[38px] px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      >
                        Inspect Dossier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EVIDENCE DOSSIER INSPECTION MODAL */}
        {selectedReport && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedReport(null)}
          >
            <div
              className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-xl bg-white dark:bg-[#0c1f38] border-2 border-[#1b3a63] shadow-2xl p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1b3a63]">
                <div className="flex items-center gap-3">
                  <EmblemOfIndia size={42} gold />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                      Official Investigation Docket · Ref #{selectedReport.id.slice(0, 12)}
                    </span>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Digital Arrest Incident Evidence Dossier
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
                  aria-label="Close dossier"
                >
                  ✕
                </button>
              </div>

              {/* Assessment header */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1b3a63] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Threat Verdict</p>
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">
                    {selectedReport.risk_level} SEVERITY ({selectedReport.risk_score} / 100)
                  </p>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    Identified Pattern: {selectedReport.scam_type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logged Timestamp</p>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase">
                    Format: {selectedReport.input_type}
                  </p>
                </div>
              </div>

              {/* Extracted evidence text with highlight */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Citizen Submission / Intercepted Content
                </h3>
                <HighlightedText
                  text={selectedReport.analyzed_text}
                  flags={selectedReport.red_flags || []}
                />
              </div>

              {/* Red flags */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Identified Coercion &amp; Extortion Tactics
                </h3>
                <div className="space-y-2">
                  {selectedReport.red_flags.map((flag, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/80 text-xs"
                    >
                      <p className="font-extrabold text-red-800 dark:text-red-300">
                        &ldquo;{flag.phrase}&rdquo; <span className="opacity-80 font-bold uppercase">[{flag.category}]</span>
                      </p>
                      <p className="text-red-700 dark:text-red-400 mt-0.5">{flag.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions suggested */}
              {selectedReport.actions.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Safety Advice Dispatched to Citizen
                  </h3>
                  <ul className="list-disc pl-5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {selectedReport.actions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Precedents */}
              {selectedReport.similar_cases.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Verified Precedents &amp; Law Enforcement Advisories
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    {selectedReport.similar_cases.map((sc, i) => (
                      <a
                        key={i}
                        href={sc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 rounded-lg bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#162f52] text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        🔗 {sc.title} ({sc.url})
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-[#1b3a63] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
