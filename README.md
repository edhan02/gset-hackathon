# Digital Arrest & Cyber Fraud Shield — Web Frontend

Production-quality frontend for scam detection and digital arrest pattern analysis, built with **Vite, React 18, TypeScript (strict), and Tailwind CSS**.

Designed for Indian users targeting coercion, extortion, and impersonation scams (e.g. fraudulent CBI, ED, Police, Customs, or TRAI notices).

---

## Zero Mock Data Policy

In accordance with strict production requirements, this application contains **no mock data, fixtures, fake responses, placeholder results, sample texts, dummy data, or simulated progress**.

- If the backend webhook URL is not configured, the interface displays an honest **"Backend not configured"** status banner and disables submission.
- All risk scores, modus operandi summaries, identified red flags, actionable guidance, and precedent incident links are rendered strictly from authentic responses returned by the live backend.
- The evaluation benchmark page starts in a clean empty state until you supply your own dataset.

---

## Tech Stack & Architecture

- **Framework**: React 18 + TypeScript (`strict: true`, no `any`)
- **Styling**: Tailwind CSS (mobile-first, responsive, full dark mode support)
- **Routing**: `react-router-dom` v6 (lazy-loaded evaluation route)
- **Testing**: Vitest with unit tests on pure helper functions
- **Linting & Code Quality**: ESLint + Prettier

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm 9+

### 2. Installation
```bash
cd shield-web
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# Default API endpoint proxied by Vite
VITE_API_URL=/api/analyze

# Your live n8n webhook URL
VITE_N8N_WEBHOOK_URL=https://bugbusters7.app.n8n.cloud/webhook-test/shield-analyze

# Supabase Credentials (Single table: scam_reports)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Supabase Storage (Single Table: `scam_reports`)

Every time a citizen tests an input (text, screenshot, or audio recording), the analyzed report is automatically logged into your Supabase database table `scam_reports`.

### Setting Up the Table
Open your **Supabase Dashboard -> SQL Editor** and execute the script in [`supabase_schema.sql`](./supabase_schema.sql):

```sql
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

alter table scam_reports enable row level security;
create policy "Allow anonymous insert" on scam_reports for insert with check (true);
create policy "Allow anonymous select" on scam_reports for select using (true);
create policy "Allow anonymous update" on scam_reports for update using (true);
```

---

## Officer Command Portal (`/officer`)

Accessible via the header link **"Officer Portal"** or `/officer`.

### Authorized Demo Login
- **Badge ID**: `OFFICER-1930`
- **Passcode**: `shield1930`
- Or click the **"Quick Demo Login"** button on the portal screen.

### Portal Features
- **High Risk / Likely Scammed (Priority)**: Isolates cases with `HIGH` risk or score $\ge 70$, representing active intimidation / extortion threats.
- **All Ingested Reports**: Full timeline of all analyses with keyword search and media filters (Text, Screenshots, Audio).
- **Incident Evidence Dossier**: Deep dive into citizen's exact input, flagged phrases, coercion tactics, and precedent links.
- **Triage Action Controls**: Update incident status (`Pending Review`, `Helpline 1930 Escalated`, `Under Investigation`, `Resolved`).

### 4. Running Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Running Tests & Linting
```bash
# Run unit test suite
npm test

# Run ESLint check
npm run lint

# Production build
npm run build
```

---

## API Contract

The frontend issues a `POST` request to `VITE_API_URL` (`/api/analyze`) using `multipart/form-data`.

### Request Fields
Exactly one of the following fields is sent per submission:
- `text`: string (plain text, max 5,000 characters)
- `image`: binary file (PNG, JPG, JPEG, WEBP, max 5 MB)
- `audio`: binary file (MP3, WAV, OGG, M4A, WEBM, max 10 MB)

### Success Response (`200 OK`)
```json
{
  "ok": true,
  "risk": {
    "score": 88,
    "level": "HIGH"
  },
  "scam_type": "Digital arrest (impersonating CBI)",
  "summary": "This message exhibits aggressive intimidation patterns typical of impersonation scams.",
  "red_flags": [
    {
      "phrase": "immediate arrest warrant",
      "category": "Intimidation",
      "why": "Law enforcement agencies do not serve warrants over chat apps."
    }
  ],
  "actions": [
    "Do not transfer money or share banking credentials.",
    "Cease all communication with the caller immediately."
  ],
  "similar_cases": [
    {
      "title": "CBI issues advisory warning citizens against digital arrest frauds",
      "url": "https://cybercrime.gov.in"
    }
  ],
  "analyzed_text": "Immediate arrest warrant issued by CBI officer...",
  "input_type": "text",
  "disclaimer": "This is an automated safety analysis tool, not a legal verdict.",
  "analyzed_at": "2026-10-22T08:00:00.000Z"
}
```

### Error Responses
- `400 Bad Request`: `{ "ok": false, "error": "no_input", "message": "..." }`
- `422 Unprocessable`: `{ "ok": false, "error": "no_text_found", "message": "..." }`
- Network or 5xx: Handled with friendly, actionable error messages and retry controls.

---

## Evaluation Benchmark (`/evaluation`)

The evaluation page enables empirical benchmarking of your detection model without preloaded data.

1. Navigate to `/evaluation` via the header link.
2. Prepare a dataset in either **JSON** or **CSV** format containing:
   - `text`: the suspicious or legitimate communication snippet.
   - `label`: ground-truth label, either `"scam"` or `"legit"`.

**JSON Format Example:**
```json
[
  { "text": "CBI arrest notice: Transfer bail bond immediately.", "label": "scam" },
  { "text": "Your electricity bill for October is due tomorrow.", "label": "legit" }
]
```

**CSV Format Example:**
```csv
text,label
"CBI arrest notice: Transfer bail bond immediately.",scam
"Your electricity bill for October is due tomorrow.",legit
```

3. Click **"Choose file (.json or .csv)"** to upload your dataset.
4. Select detection threshold:
   - **Medium or Higher**: Classifies `MEDIUM` and `HIGH` as scam predictions.
   - **High Risk Only**: Classifies only `HIGH` as scam predictions.
5. Click **"Start Evaluation"**. The frontend sequentially sends each entry to the real backend, plots the confusion matrix, calculates Precision, Recall, F1 score, and False Alarm Rate, and lets you export results as CSV.
