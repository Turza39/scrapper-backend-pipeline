'use client';

import { useCallback, useRef } from 'react';
import { WsState, StreamEvent, PipelineStepName, StepStatus, MockChunk } from '@/types';

const MOCK_CHUNKS: MockChunk[] = [
  {
    chunk_index: 0,
    start_time: '00:00:00',
    end_time: '00:00:05',
    segments: [
      {
        speaker: 'Speaker 1',
        text: "Alright everyone, let's get started. We have quite a lot to cover today — primarily the status of the deployment pipeline migration and any blockers we need to address before end of week.",
      },
    ],
    events: [],
  },
  {
    chunk_index: 1,
    start_time: '00:00:05',
    end_time: '00:00:10',
    segments: [
      {
        speaker: 'Speaker 2',
        text: "Before we dive into migration, I want to flag that our CI pipeline has been failing intermittently since Tuesday. Three builds failed yesterday alone. I think we need to address that first.",
      },
    ],
    events: [],
  },
  {
    chunk_index: 2,
    start_time: '00:00:10',
    end_time: '00:00:15',
    segments: [
      {
        speaker: 'Speaker 1',
        text: "Agreed. That's a hard blocker. So the decision is: we fix CI stability before we attempt any migration work.",
      },
    ],
    events: [
      {
        type: 'decision_detected',
        text: 'Fix CI pipeline stability before proceeding with deployment migration',
        speaker: 'Speaker 1',
        timestamp: '00:00:13',
      },
    ],
  },
  {
    chunk_index: 3,
    start_time: '00:00:15',
    end_time: '00:00:20',
    segments: [
      {
        speaker: 'Speaker 3',
        text: "I can take ownership of the CI investigation. I'll need access to the full build logs and the infrastructure team's communication channel.",
      },
    ],
    events: [
      {
        type: 'action_item_detected',
        text: 'Speaker 3 to investigate and resolve CI pipeline failures',
        speaker: 'Speaker 3',
        timestamp: '00:00:17',
      },
    ],
  },
  {
    chunk_index: 4,
    start_time: '00:00:20',
    end_time: '00:00:25',
    segments: [
      {
        speaker: 'Speaker 2',
        text: "I'll get you added to the infra channel right after this call. Should only take about five minutes.",
      },
    ],
    events: [
      {
        type: 'action_item_detected',
        text: 'Speaker 2 to add Speaker 3 to infrastructure Slack channel',
        speaker: 'Speaker 2',
        timestamp: '00:00:22',
      },
    ],
  },
  {
    chunk_index: 5,
    start_time: '00:00:25',
    end_time: '00:00:30',
    segments: [
      {
        speaker: 'Speaker 1',
        text: "Good. Now on the migration itself — what is the current status of the Docker image builds?",
      },
    ],
    events: [
      {
        type: 'topic_update',
        text: 'Docker image build status for deployment migration',
        speaker: 'Speaker 1',
        timestamp: '00:00:27',
      },
    ],
  },
  {
    chunk_index: 6,
    start_time: '00:00:30',
    end_time: '00:00:35',
    segments: [
      {
        speaker: 'Speaker 2',
        text: "Base images are ready and fully tested. We are blocked on the secrets injection layer — the configuration management piece has not been finalized with the security team yet.",
      },
    ],
    events: [],
  },
  {
    chunk_index: 7,
    start_time: '00:00:35',
    end_time: '00:00:40',
    segments: [
      { speaker: 'Speaker 1', text: "How long to unblock that?" },
      {
        speaker: 'Speaker 2',
        text: "Three to four days if we get priority support. Otherwise it could stretch to a full week.",
      },
    ],
    events: [],
  },
  {
    chunk_index: 8,
    start_time: '00:00:40',
    end_time: '00:00:45',
    segments: [
      {
        speaker: 'Speaker 3',
        text: "Should we set up a working session with the security team this week? I can coordinate that if needed.",
      },
    ],
    events: [
      {
        type: 'action_item_detected',
        text: 'Speaker 3 to schedule working session with security team this week',
        speaker: 'Speaker 3',
        timestamp: '00:00:43',
      },
    ],
  },
  {
    chunk_index: 9,
    start_time: '00:00:45',
    end_time: '00:00:50',
    segments: [
      {
        speaker: 'Speaker 1',
        text: "Yes, do that. Aim for Wednesday or Thursday. And let's set a concrete target — full pipeline running in staging by end of next week.",
      },
    ],
    events: [
      {
        type: 'decision_detected',
        text: 'Target: deployment pipeline running in staging by end of next week',
        speaker: 'Speaker 1',
        timestamp: '00:00:49',
      },
    ],
  },
  {
    chunk_index: 10,
    start_time: '00:00:50',
    end_time: '00:00:55',
    segments: [
      {
        speaker: 'Speaker 2',
        text: "That's achievable if we unblock the security piece this week. I'll also start writing the rollback procedure document — we need a safety net before any production cutover.",
      },
    ],
    events: [
      {
        type: 'action_item_detected',
        text: 'Speaker 2 to document rollback procedure before production cutover',
        speaker: 'Speaker 2',
        timestamp: '00:00:52',
      },
    ],
  },
  {
    chunk_index: 11,
    start_time: '00:00:55',
    end_time: '00:01:00',
    segments: [
      { speaker: 'Speaker 1', text: "Any other blockers before we wrap up?" },
      {
        speaker: 'Speaker 3',
        text: "Monitoring. We do not have alerting configured for the new pipeline yet. If something breaks in staging, we will not know about it fast enough.",
      },
    ],
    events: [
      {
        type: 'topic_update',
        text: 'Monitoring and alerting gaps in new pipeline',
        speaker: 'Speaker 3',
        timestamp: '00:00:58',
      },
    ],
  },
  {
    chunk_index: 12,
    start_time: '00:01:00',
    end_time: '00:01:05',
    segments: [
      { speaker: 'Speaker 1', text: "Good catch. Who is picking that up?" },
      {
        speaker: 'Speaker 2',
        text: "I can set up basic Prometheus scraping. Grafana dashboards will take a bit longer but we can start with raw metrics first.",
      },
    ],
    events: [
      {
        type: 'action_item_detected',
        text: 'Speaker 2 to configure Prometheus metrics scraping for the new pipeline',
        speaker: 'Speaker 2',
        timestamp: '00:01:03',
      },
    ],
  },
  {
    chunk_index: 13,
    start_time: '00:01:05',
    end_time: '00:01:10',
    segments: [
      {
        speaker: 'Speaker 1',
        text: "Start with basics and iterate on dashboards later. Solid plan overall. Let's reconvene Friday to check progress across all these items.",
      },
    ],
    events: [
      {
        type: 'decision_detected',
        text: 'Reconvene Friday to review progress on all pipeline migration tasks',
        speaker: 'Speaker 1',
        timestamp: '00:01:08',
      },
    ],
  },
];

const CHUNK_INTERVAL_MS = 7000;

interface UseMockPipelineOptions {
  onEvent: (event: StreamEvent) => void;
  onStateChange: (state: WsState) => void;
  onStepChange: (step: PipelineStepName, status: StepStatus) => void;
  onMetrics: (metrics: {
    progress: number;
    chunksProcessed: number;
    totalChunks: number;
    avgLatencyMs: number;
  }) => void;
}

export function useMockPipeline(opts: UseMockPipelineOptions) {
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    timeoutsRef.current.push(t);
    return t;
  }, []);

  const start = useCallback(
    (_sessionId: string) => {
      clearAll();
      const totalChunks = MOCK_CHUNKS.length;
      const latencies: number[] = [];

      // Step: upload already done, start chunking
      optsRef.current.onStepChange('upload', 'done');

      addTimeout(() => {
        optsRef.current.onStepChange('chunking', 'running');
        optsRef.current.onStateChange('live');
      }, 600);

      addTimeout(() => {
        optsRef.current.onStepChange('chunking', 'done');
        optsRef.current.onStepChange('transcription', 'running');
        optsRef.current.onStepChange('diarization', 'running');
      }, 2800);

      addTimeout(() => {
        optsRef.current.onStepChange('event_extraction', 'running');
      }, 4200);

      // Schedule each chunk arriving with realistic delays
      MOCK_CHUNKS.forEach((chunk, i) => {
        const chunkDelay = 5000 + i * CHUNK_INTERVAL_MS;

        addTimeout(() => {
          const latency = 180 + Math.round(Math.random() * 280);
          latencies.push(latency);
          const avgLatency = Math.round(
            latencies.reduce((a, b) => a + b, 0) / latencies.length
          );
          const progress = Math.round(((i + 1) / totalChunks) * 100);

          // Emit transcription chunk
          optsRef.current.onEvent({
            type: 'transcription_chunk',
            chunk_index: chunk.chunk_index,
            start_time: chunk.start_time,
            end_time: chunk.end_time,
            segments: chunk.segments,
            timestamp: chunk.start_time,
          });

          // Emit extracted events with overlap delay (like queue workers)
          chunk.events.forEach((ev, j) => {
            addTimeout(() => {
              optsRef.current.onEvent({
                type: ev.type,
                text: ev.text,
                speaker: ev.speaker,
                timestamp: ev.timestamp,
              });
            }, 900 + j * 500);
          });

          // Emit metrics update
          optsRef.current.onMetrics({
            progress,
            chunksProcessed: i + 1,
            totalChunks,
            avgLatencyMs: avgLatency,
          });

          // Last chunk: mark pipeline complete
          if (i === MOCK_CHUNKS.length - 1) {
            addTimeout(() => {
              optsRef.current.onStepChange('transcription', 'done');
              optsRef.current.onStepChange('diarization', 'done');
              optsRef.current.onStepChange('event_extraction', 'done');
              optsRef.current.onStepChange('complete', 'done');
              optsRef.current.onStateChange('disconnected');
            }, 2500);
          }
        }, chunkDelay);
      });
    },
    [clearAll, addTimeout]
  );

  const stop = useCallback(() => {
    clearAll();
    optsRef.current.onStateChange('disconnected');
  }, [clearAll]);

  return { start, stop };
}
