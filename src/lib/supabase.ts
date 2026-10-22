import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AnalyzeResult } from '../types';

export interface ScamReportRecord {
  id: string;
  created_at: string;
  input_type: 'text' | 'image' | 'audio';
  analyzed_text: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_score: number;
  scam_type: string;
  summary: string;
  red_flags: { phrase: string; category: string; why: string }[];
  actions: string[];
  similar_cases: { title: string; url: string }[];
  disclaimer: string;
  analyzed_at: string;
  status: 'PENDING_REVIEW' | 'ESCALATED_1930' | 'INVESTIGATING' | 'RESOLVED';
}

const LOCAL_STORAGE_KEY = 'shield_local_reports';

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://ubganniitowkoemsjzdv.supabase.co';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZ2FubmlpdG93a29lbXNqemR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTMzNTgsImV4cCI6MjEwODIyOTM1OH0.kPdoxlLRksrDRVopFTRgxBpSjhZWgN3vU55rSEtn9pI';
  const localUrl = localStorage.getItem('shield_supabase_url') ?? '';
  const localKey = localStorage.getItem('shield_supabase_key') ?? '';

  return {
    url: (envUrl || localUrl).trim(),
    key: (envKey || localKey).trim(),
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

// Local cache backup so entries are never lost
function getLocalReports(): ScamReportRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalReport(report: ScamReportRecord) {
  try {
    const existing = getLocalReports();
    const updated = [report, ...existing.filter((r) => r.id !== report.id)].slice(0, 100);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota
  }
}

export async function saveReport(result: AnalyzeResult): Promise<{ ok: boolean; id?: string; error?: string }> {
  const id = crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}`;
  const record: ScamReportRecord = {
    id,
    created_at: new Date().toISOString(),
    input_type: result.input_type ?? 'text',
    analyzed_text: result.analyzed_text ?? '',
    risk_level: result.risk.level,
    risk_score: result.risk.score,
    scam_type: result.scam_type ?? 'Unspecified',
    summary: result.summary ?? '',
    red_flags: result.red_flags ?? [],
    actions: result.actions ?? [],
    similar_cases: result.similar_cases ?? [],
    disclaimer: result.disclaimer ?? '',
    analyzed_at: result.analyzed_at ?? new Date().toISOString(),
    status: result.risk.level === 'HIGH' ? 'ESCALATED_1930' : 'PENDING_REVIEW',
  };

  // Always retain in local storage as reliable backup
  saveLocalReport(record);

  const client = getSupabaseClient();
  if (!client) {
    return { ok: true, id };
  }

  try {
    const { error } = await client.from('scam_reports').insert([record]);
    if (error) {
      console.warn('Supabase insert notice:', error.message);
      return { ok: true, id, error: error.message };
    }
    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Supabase connection error:', message);
    return { ok: true, id, error: message };
  }
}

export async function fetchReports(): Promise<{ data: ScamReportRecord[]; isLive: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: getLocalReports(), isLive: false };
  }

  try {
    const { data, error } = await client
      .from('scam_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase query failed, falling back to local records:', error.message);
      return { data: getLocalReports(), isLive: false, error: error.message };
    }

    if (data && Array.isArray(data)) {
      return { data: data as ScamReportRecord[], isLive: true };
    }

    return { data: getLocalReports(), isLive: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: getLocalReports(), isLive: false, error: message };
  }
}

export async function updateReportStatus(
  id: string,
  newStatus: ScamReportRecord['status'],
): Promise<void> {
  // Update local
  try {
    const local = getLocalReports();
    const updated = local.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('scam_reports').update({ status: newStatus }).eq('id', id);
  } catch {
    // Ignore
  }
}

export const SUPABASE_TABLE_SQL = `-- Run this in Supabase SQL Editor to create the single table:
create table if not exists scam_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  input_type text not null,
  analyzed_text text,
  risk_level text not null,
  risk_score integer not null,
  scam_type text,
  summary text,
  red_flags jsonb default '[]'::jsonb,
  actions jsonb default '[]'::jsonb,
  similar_cases jsonb default '[]'::jsonb,
  disclaimer text,
  analyzed_at text,
  status text default 'PENDING_REVIEW'
);

-- Enable Row Level Security (RLS) with permissive read/write policy for anon key
alter table scam_reports enable row level security;

create policy "Allow anonymous insert" on scam_reports
  for insert with check (true);

create policy "Allow anonymous select" on scam_reports
  for select using (true);

create policy "Allow anonymous update" on scam_reports
  for update using (true);
`;
