export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RedFlag {
  phrase: string;
  category: string;
  why: string;
}

export interface SimilarCase {
  title: string;
  url: string;
}

export interface AnalyzeResult {
  ok: true;
  risk: { score: number; level: RiskLevel };
  scam_type: string;
  summary: string;
  red_flags: RedFlag[];
  actions: string[];
  similar_cases: SimilarCase[];
  analyzed_text: string;
  input_type: 'text' | 'image' | 'audio';
  disclaimer: string;
  analyzed_at: string;
}

export interface ApiError {
  ok: false;
  error: string;
  message: string;
}

export type ApiResponse =
  | { status: 'ok'; data: AnalyzeResult }
  | { status: 'error'; code: string; message: string };

export type AppState =
  | { phase: 'idle' }
  | { phase: 'validating' }
  | { phase: 'loading'; startedAt: number }
  | { phase: 'success'; result: AnalyzeResult }
  | { phase: 'error'; code: string; message: string };

export type InputTab = 'text' | 'image' | 'audio';
