const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export interface UploadResult {
  session_id: string;
  filename: string;
  size: number;
  status: string;
}

export interface ProcessOptions {
  chunk_size_seconds?: number;
  enable_diarization?: boolean;
  enable_event_extraction?: boolean;
}

export async function uploadAudio(file: File): Promise<UploadResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
    return {
      session_id: `mock-${Date.now().toString(36)}`,
      filename: file.name,
      size: file.size,
      status: 'uploaded',
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function startProcessing(
  sessionId: string,
  opts: ProcessOptions = {}
): Promise<{ status: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return { status: 'processing' };
  }

  const res = await fetch(`${BASE_URL}/process/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`Start processing failed: ${res.statusText}`);
  return res.json();
}

export async function getStatus(sessionId: string): Promise<{ session_id: string; status: string }> {
  if (USE_MOCK) {
    return { session_id: sessionId, status: 'processing' };
  }

  const res = await fetch(`${BASE_URL}/status/${sessionId}`);
  if (!res.ok) throw new Error(`Status check failed: ${res.statusText}`);
  return res.json();
}

export function getWsUrl(sessionId: string): string {
  const wsBase = process.env.NEXT_PUBLIC_WS_BASE_URL ?? 'ws://localhost:8000';
  return `${wsBase}/stream/${sessionId}`;
}

export async function getTranscript(sessionId: string): Promise<{ session_id: string; transcript: string | null }> {
  if (USE_MOCK) {
    return { session_id: sessionId, transcript: `Mock transcript for ${sessionId}` };
  }

  const res = await fetch(`${BASE_URL}/transcript/${sessionId}`);
  if (!res.ok) throw new Error(`Transcript fetch failed: ${res.statusText}`);
  return res.json();
}
