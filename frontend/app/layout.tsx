import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RTSIP — Real-Time Streaming Intelligence Platform',
  description:
    'Dashboard for processing live and recorded audio streams into real-time structured insights: transcription, speaker diarization, and semantic event extraction.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
