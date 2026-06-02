export type WsState = 'disconnected' | 'connecting' | 'live' | 'error';

export type EventType =
  | 'transcription_chunk'
  | 'speaker_segment'
  | 'decision_detected'
  | 'action_item_detected'
  | 'topic_update'
  | 'question_detected'
  | 'system_metrics'
  | 'pipeline_step';

export interface TranscriptSegment {
  speaker: string;
  text: string;
}

export interface StreamEvent {
  type: EventType;
  speaker?: string;
  text?: string;
  timestamp?: string;
  chunk_index?: number;
  start_time?: string;
  end_time?: string;
  segments?: TranscriptSegment[];
  data?: Record<string, unknown>;
}

export interface ExtractedEvent {
  id: string;
  type: 'decision_detected' | 'action_item_detected' | 'topic_update' | 'question_detected';
  text: string;
  speaker: string;
  timestamp: string;
}

export type PipelineStepName =
  | 'upload'
  | 'chunking'
  | 'transcription'
  | 'diarization'
  | 'event_extraction'
  | 'complete';

export type StepStatus = 'pending' | 'running' | 'done' | 'error';

export interface PipelineStep {
  name: PipelineStepName;
  label: string;
  status: StepStatus;
}

export interface SessionState {
  sessionId: string | null;
  fileName: string | null;
  fileSize: number | null;
  isUploading: boolean;
  isProcessing: boolean;
  isDone: boolean;
  steps: PipelineStep[];
  progress: number;
  chunksProcessed: number;
  totalChunks: number;
  avgLatencyMs: number;
}

export interface TranscriptMessage {
  id: string;
  speaker: string;
  speakerIndex: number;
  text: string;
  timestamp: string;
  isNew: boolean;
}

export interface MockChunk {
  chunk_index: number;
  start_time: string;
  end_time: string;
  segments: TranscriptSegment[];
  events: Omit<ExtractedEvent, 'id'>[];
}
