import { useReducer, useRef, useCallback } from 'react';
import { analyze } from '../api/client';
import type { AppState } from '../types';

type InputPayload =
  | { type: 'text'; value: string }
  | { type: 'image'; file: File }
  | { type: 'audio'; file: File };

type Action =
  | { kind: 'VALIDATE' }
  | { kind: 'LOAD'; startedAt: number }
  | { kind: 'SUCCESS'; result: import('../types').AnalyzeResult }
  | { kind: 'ERROR'; code: string; message: string }
  | { kind: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.kind) {
    case 'VALIDATE':
      return { phase: 'validating' };
    case 'LOAD':
      return { phase: 'loading', startedAt: action.startedAt };
    case 'SUCCESS':
      return { phase: 'success', result: action.result };
    case 'ERROR':
      return { phase: 'error', code: action.code, message: action.message };
    case 'RESET':
      return { phase: 'idle' };
    default:
      return state;
  }
}

const TIMEOUT_MS = 60_000;

export function useAnalyze() {
  const [state, dispatch] = useReducer(reducer, { phase: 'idle' });
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submit = useCallback(async (input: InputPayload) => {
    // Cancel any in-flight request
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ kind: 'VALIDATE' });

    const startedAt = Date.now();
    dispatch({ kind: 'LOAD', startedAt });

    timeoutRef.current = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);

    const result = await analyze(input, controller.signal);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (result.status === 'ok') {
      dispatch({ kind: 'SUCCESS', result: result.data });
    } else {
      dispatch({ kind: 'ERROR', code: result.code, message: result.message });
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    dispatch({ kind: 'ERROR', code: 'aborted', message: 'Request cancelled.' });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    dispatch({ kind: 'RESET' });
  }, []);

  return { state, submit, cancel, reset };
}
