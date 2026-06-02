'use client';

import { useReducer } from 'react';
import { PipelineStep, PipelineStepName, SessionState, StepStatus } from '@/types';

const INITIAL_STEPS: PipelineStep[] = [
  { name: 'upload', label: 'Upload', status: 'pending' },
  { name: 'chunking', label: 'Chunking', status: 'pending' },
  { name: 'transcription', label: 'Transcription', status: 'pending' },
  { name: 'diarization', label: 'Diarization', status: 'pending' },
  { name: 'event_extraction', label: 'Event Extraction', status: 'pending' },
  { name: 'complete', label: 'Complete', status: 'pending' },
];

const initialState: SessionState = {
  sessionId: null,
  fileName: null,
  fileSize: null,
  isUploading: false,
  isProcessing: false,
  isDone: false,
  steps: INITIAL_STEPS,
  progress: 0,
  chunksProcessed: 0,
  totalChunks: 0,
  avgLatencyMs: 0,
};

type Action =
  | { type: 'SET_UPLOADING' }
  | {
      type: 'SET_FILE';
      payload: { sessionId: string; fileName: string; fileSize: number };
    }
  | { type: 'START_PROCESSING' }
  | { type: 'UPDATE_STEP'; payload: { step: PipelineStepName; status: StepStatus } }
  | {
      type: 'UPDATE_METRICS';
      payload: {
        progress: number;
        chunksProcessed: number;
        totalChunks: number;
        avgLatencyMs: number;
      };
    }
  | { type: 'RESET' };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'SET_UPLOADING':
      return { ...state, isUploading: true };

    case 'SET_FILE':
      return {
        ...state,
        isUploading: false,
        sessionId: action.payload.sessionId,
        fileName: action.payload.fileName,
        fileSize: action.payload.fileSize,
        steps: INITIAL_STEPS.map((s) =>
          s.name === 'upload' ? { ...s, status: 'done' as StepStatus } : s
        ),
      };

    case 'START_PROCESSING':
      return {
        ...state,
        isProcessing: true,
        isDone: false,
        progress: 0,
        chunksProcessed: 0,
        totalChunks: 0,
        steps: INITIAL_STEPS.map((s) =>
          s.name === 'upload' ? { ...s, status: 'done' as StepStatus } : { ...s, status: 'pending' as StepStatus }
        ),
      };

    case 'UPDATE_STEP': {
      const isDone =
        action.payload.step === 'complete' && action.payload.status === 'done';
      return {
        ...state,
        steps: state.steps.map((s) =>
          s.name === action.payload.step ? { ...s, status: action.payload.status } : s
        ),
        isDone: isDone ? true : state.isDone,
        isProcessing: isDone ? false : state.isProcessing,
      };
    }

    case 'UPDATE_METRICS':
      return { ...state, ...action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useSession() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
