'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Header from '@/components/Header/Header';
import StatusBar from '@/components/StatusBar/StatusBar';
import SessionInfo from '@/components/SessionInfo/SessionInfo';
import UploadPanel from '@/components/UploadPanel/UploadPanel';
import PipelineControls from '@/components/PipelineControls/PipelineControls';
import ProgressPanel from '@/components/ProgressPanel/ProgressPanel';
import { OutputPanel } from '@/components/OutputPanel/OutputPanel';
import { useSession } from '@/hooks/useSession';
import { useMockPipeline } from '@/hooks/useMockPipeline';
import { uploadAudio, startProcessing, ProcessOptions, getWsUrl } from '@/lib/api';
import { WsState, StreamEvent, TranscriptMessage, ExtractedEvent } from '@/types';
import styles from './page.module.css';

export default function Home() {
  const { state: session, dispatch } = useSession();
  const [wsState, setWsState] = useState<WsState>('disconnected');
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [events, setEvents] = useState<ExtractedEvent[]>([]);
  const [rawEvents, setRawEvents] = useState<StreamEvent[]>([]);
  const [speakerMap, setSpeakerMap] = useState<Record<string, number>>({});
  const [options, setOptions] = useState<ProcessOptions>({
    chunk_size_seconds: 5,
    enable_diarization: true,
    enable_event_extraction: true,
  });

  const wsRef = useRef<WebSocket | null>(null);

  // Is mock mode enabled based on env variables
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  // Event handlers for the pipeline (Mock & Real WS share these)
  const handleEvent = useCallback((event: StreamEvent) => {
    // Append to raw stream JSON list
    setRawEvents((prev) => [...prev, event]);

    // Handle transcription chunks
    if (event.type === 'transcription_chunk') {
      if (event.segments) {
        setSpeakerMap((prevMap) => {
          const nextMap = { ...prevMap };
          let updated = false;

          // Assure each speaker has a unique stable index
          event.segments!.forEach((seg) => {
            if (nextMap[seg.speaker] === undefined) {
              nextMap[seg.speaker] = Object.keys(nextMap).length;
              updated = true;
            }
          });

          const newMsgs = event.segments!.map((seg, idx) => {
            const sIdx = nextMap[seg.speaker];
            return {
              id: `${event.chunk_index ?? 0}-${idx}-${Date.now()}`,
              speaker: seg.speaker,
              speakerIndex: sIdx,
              text: seg.text,
              timestamp: event.timestamp || '00:00:00',
              isNew: true,
            };
          });

          setMessages((prev) => [...prev, ...newMsgs]);
          return updated ? nextMap : prevMap;
        });
      }
    }
    // Handle extracted semantic events
    else if (
      event.type === 'decision_detected' ||
      event.type === 'action_item_detected' ||
      event.type === 'topic_update' ||
      event.type === 'question_detected'
    ) {
      const newEvent: ExtractedEvent = {
        id: `${event.type}-${Date.now()}-${Math.random()}`,
        type: event.type,
        text: event.text || '',
        speaker: event.speaker || 'System',
        timestamp: event.timestamp || '00:00:00',
      };
      setEvents((prev) => [...prev, newEvent]);
    }
  }, []);

  const handleStepChange = useCallback((step: any, status: any) => {
    dispatch({ type: 'UPDATE_STEP', payload: { step, status } });
  }, [dispatch]);

  const handleMetrics = useCallback((metrics: any) => {
    dispatch({ type: 'UPDATE_METRICS', payload: metrics });
  }, [dispatch]);

  // Instantiate the mock pipeline hook
  const mockPipeline = useMockPipeline({
    onEvent: handleEvent,
    onStateChange: setWsState,
    onStepChange: handleStepChange,
    onMetrics: handleMetrics,
  });

  // Handle actual production WebSocket connections
  const startRealWebSocket = useCallback((sessionId: string) => {
    if (wsRef.current) wsRef.current.close();

    setWsState('connecting');
    dispatch({ type: 'UPDATE_STEP', payload: { step: 'chunking', status: 'running' } });

    const wsUrl = getWsUrl(sessionId);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsState('live');
      dispatch({ type: 'UPDATE_STEP', payload: { step: 'chunking', status: 'done' } });
      dispatch({ type: 'UPDATE_STEP', payload: { step: 'transcription', status: 'running' } });
      dispatch({ type: 'UPDATE_STEP', payload: { step: 'diarization', status: 'running' } });
      if (options.enable_event_extraction) {
        dispatch({ type: 'UPDATE_STEP', payload: { step: 'event_extraction', status: 'running' } });
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;

        // Custom protocol routing if needed
        if (data.type === 'pipeline_step') {
          const payload = data.data as { step: any; status: any };
          if (payload) {
            dispatch({ type: 'UPDATE_STEP', payload: { step: payload.step, status: payload.status } });
          }
        } else if (data.type === 'system_metrics') {
          const payload = data.data as {
            progress: number;
            chunksProcessed: number;
            totalChunks: number;
            avgLatencyMs: number;
          };
          if (payload) {
            dispatch({ type: 'UPDATE_METRICS', payload });
          }
        } else {
          handleEvent(data);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = () => {
      setWsState('error');
      dispatch({ type: 'UPDATE_STEP', payload: { step: 'transcription', status: 'error' } });
    };

    ws.onclose = () => {
      setWsState('disconnected');
    };
  }, [dispatch, options.enable_event_extraction, handleEvent]);

  // Handle uploading audio file
  const handleUpload = async (file: File) => {
    dispatch({ type: 'SET_UPLOADING' });
    try {
      const res = await uploadAudio(file);
      dispatch({
        type: 'SET_FILE',
        payload: {
          sessionId: res.session_id,
          fileName: res.filename,
          fileSize: res.size,
        },
      });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'RESET' });
    }
  };

  // Start processing pipeline
  const handleExtract = async () => {
    if (!session.sessionId) return;

    dispatch({ type: 'START_PROCESSING' });
    setMessages([]);
    setEvents([]);
    setRawEvents([]);
    setSpeakerMap({});

    try {
      await startProcessing(session.sessionId, options);

      if (isMockMode) {
        mockPipeline.start(session.sessionId);
      } else {
        startRealWebSocket(session.sessionId);
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: 'UPDATE_STEP', payload: { step: 'chunking', status: 'error' } });
    }
  };

  // Reset entire dashboard
  const handleReset = () => {
    if (isMockMode) {
      mockPipeline.stop();
    } else if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    dispatch({ type: 'RESET' });
    setWsState('disconnected');
    setMessages([]);
    setEvents([]);
    setRawEvents([]);
    setSpeakerMap({});
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMockMode) {
        mockPipeline.stop();
      } else if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isMockMode, mockPipeline]);

  return (
    <div className={styles.page}>
      <Header wsState={wsState} />

      <main className={styles.main}>
        <aside className={styles.leftPanel}>
          <div className={styles.panelContent}>
            <UploadPanel
              onUpload={handleUpload}
              isUploading={session.isUploading}
              disabled={session.isProcessing}
              currentFile={session.fileName}
            />

            {session.sessionId && (
              <SessionInfo
                sessionId={session.sessionId}
                fileName={session.fileName}
                fileSize={session.fileSize}
              />
            )}

            <PipelineControls
              onExtract={handleExtract}
              onReset={handleReset}
              canExtract={!!session.sessionId && !session.isProcessing}
              isProcessing={session.isProcessing}
              isDone={session.isDone}
              options={options}
              onOptionsChange={setOptions}
            />

            <ProgressPanel
              steps={session.steps}
              progress={session.progress}
            />
          </div>
        </aside>

        <section className={styles.rightPanel}>
          <OutputPanel
            messages={messages}
            events={events}
            rawEvents={rawEvents}
          />
        </section>
      </main>

      <StatusBar
        wsState={wsState}
        sessionId={session.sessionId}
        chunksProcessed={session.chunksProcessed}
        totalChunks={session.totalChunks}
        avgLatencyMs={session.avgLatencyMs}
        progress={session.progress}
      />
    </div>
  );
}
