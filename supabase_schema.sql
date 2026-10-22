-- ============================================================
-- Digital Arrest & Cyber Fraud Shield
-- Single Table Supabase Schema: scam_reports
-- ============================================================

-- 1. Create the single table
create table if not exists scam_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  input_type text not null,               -- 'text' | 'image' | 'audio'
  analyzed_text text,                     -- text analyzed (OCR, transcript, or pasted)
  risk_level text not null,               -- 'LOW' | 'MEDIUM' | 'HIGH'
  risk_score integer not null,            -- 0 to 100
  scam_type text,                         -- e.g. "Digital arrest scam", "Digital arrest/Extortion scam"
  summary text,                           -- executive summary
  red_flags jsonb default '[]'::jsonb,    -- [{ phrase, category, why }]
  actions jsonb default '[]'::jsonb,      -- ["Stop. Don't pay...", ...]
  similar_cases jsonb default '[]'::jsonb,-- [{ title, url }]
  disclaimer text,                        -- safety disclaimer
  analyzed_at text,                       -- ISO date
  status text default 'PENDING_REVIEW'    -- 'PENDING_REVIEW' | 'ESCALATED_1930' | 'INVESTIGATING' | 'RESOLVED'
);

-- 2. Enable Row Level Security (RLS)
alter table scam_reports enable row level security;

-- 3. Anonymous Policies (Allows frontend to log analyses and officer portal to view/update)
create policy "Allow anonymous insert" on scam_reports
  for insert with check (true);

create policy "Allow anonymous select" on scam_reports
  for select using (true);

create policy "Allow anonymous update" on scam_reports
  for update using (true);
