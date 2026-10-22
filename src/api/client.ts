import type { ApiResponse, AnalyzeResult, ApiError } from '../types';
import { saveReport } from '../lib/supabase';

// Hardcoded production endpoint for immediate out-of-the-box public GitHub deployment
export const HARDCODED_WEBHOOK_URL =
  'https://bugbusters7.app.n8n.cloud/webhook/shield-analyze';

export function isBackendConfigured(): boolean {
  // Always true because the endpoint is hardcoded as primary fallback
  return true;
}

function normalizeResult(raw: unknown, defaultInputType: 'text' | 'image' | 'audio'): AnalyzeResult | null {
  let item = raw;

  if (typeof item === 'string') {
    try {
      item = JSON.parse(item);
    } catch {
      return null;
    }
  }

  // Handle n8n array response: [ { "ok": true, ... } ]
  if (Array.isArray(item) && item.length > 0) {
    item = item[0];
  }

  if (!item || typeof item !== 'object') {
    return null;
  }

  const obj = item as Record<string, unknown>;

  // Check if payload is wrapped inside data or body
  let target = obj;
  if (obj.data && typeof obj.data === 'object' && !('risk' in obj)) {
    target = obj.data as Record<string, unknown>;
  } else if (obj.body && typeof obj.body === 'object' && !('risk' in obj)) {
    target = obj.body as Record<string, unknown>;
  }

  const riskObj = target.risk as { score?: number; level?: string } | undefined;
  if (!riskObj || typeof riskObj.score !== 'number') {
    return null;
  }

  const rawLevel = String(riskObj.level ?? 'LOW').toUpperCase();
  const level = (rawLevel === 'HIGH' || rawLevel === 'MEDIUM' || rawLevel === 'LOW') ? rawLevel : 'LOW';

  const res: AnalyzeResult = {
    ok: true,
    risk: {
      score: Math.min(100, Math.max(0, Math.round(riskObj.score))),
      level,
    },
    scam_type: typeof target.scam_type === 'string' ? target.scam_type : 'Scam Alert',
    summary: typeof target.summary === 'string' ? target.summary : '',
    red_flags: Array.isArray(target.red_flags)
      ? target.red_flags.map((rf: Record<string, unknown>) => ({
          phrase: String(rf.phrase ?? ''),
          category: String(rf.category ?? 'Unspecified'),
          why: String(rf.why ?? ''),
        }))
      : [],
    actions: Array.isArray(target.actions) ? target.actions.map(String) : [],
    similar_cases: Array.isArray(target.similar_cases)
      ? target.similar_cases.map((sc: Record<string, unknown>) => ({
          title: String(sc.title ?? ''),
          url: String(sc.url ?? ''),
        }))
      : [],
    analyzed_text: typeof target.analyzed_text === 'string' ? target.analyzed_text : '',
    input_type: (target.input_type as 'text' | 'image' | 'audio') || defaultInputType,
    disclaimer: typeof target.disclaimer === 'string' ? target.disclaimer : '',
    analyzed_at: typeof target.analyzed_at === 'string' ? target.analyzed_at : new Date().toISOString(),
  };

  return res;
}

export async function analyze(
  input: { type: 'text'; value: string } | { type: 'image'; file: File } | { type: 'audio'; file: File },
  signal: AbortSignal,
): Promise<ApiResponse> {
  const form = new FormData();
  if (input.type === 'text') {
    form.append('text', input.value);
  } else if (input.type === 'image') {
    form.append('image', input.file);
  } else {
    form.append('audio', input.file);
  }

  // Determine endpoint: in local dev use Vite proxy (/api/analyze) or direct webhook
  const primaryUrl = import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL ?? '/api/analyze')
    : (import.meta.env.VITE_N8N_WEBHOOK_URL || HARDCODED_WEBHOOK_URL);

  try {
    let res = await fetch(primaryUrl, { method: 'POST', body: form, signal });

    // Fallback directly to hardcoded webhook if proxy or primary route returned 404/5xx
    if (!res.ok && primaryUrl !== HARDCODED_WEBHOOK_URL && res.status >= 400 && res.status < 500) {
      try {
        const directRes = await fetch(HARDCODED_WEBHOOK_URL, { method: 'POST', body: form, signal });
        if (directRes.ok) {
          res = directRes;
        }
      } catch {
        // Continue with original response
      }
    }

    const json = await res.json();
    const normalized = normalizeResult(json, input.type);

    if (res.ok && normalized) {
      saveReport(normalized).catch((err) => {
        console.warn('Background report logging notice:', err);
      });
      return { status: 'ok', data: normalized };
    }

    const err = json as ApiError;
    return {
      status: 'error',
      code: err.error ?? String(res.status),
      message: err.message ?? `Analysis service notice (${res.status})`,
    };
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { status: 'error', code: 'aborted', message: 'Request cancelled.' };
    }
    // If local proxy failed, attempt direct webhook connection before giving up
    if (primaryUrl !== HARDCODED_WEBHOOK_URL) {
      try {
        const directRes = await fetch(HARDCODED_WEBHOOK_URL, { method: 'POST', body: form, signal });
        const json = await directRes.json();
        const normalized = normalizeResult(json, input.type);
        if (directRes.ok && normalized) {
          saveReport(normalized).catch(() => {});
          return { status: 'ok', data: normalized };
        }
      } catch {
        // Fall through to error
      }
    }

    return {
      status: 'error',
      code: 'network',
      message: 'Could not reach the analysis server. Check your connection and try again.',
    };
  }
}
