from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from core.config import settings

_MODEL: Any | None = None


def _load_whisper_model() -> Any:
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    try:
        import whisper
    except ImportError as exc:
        raise RuntimeError(
            "The OpenAI Whisper package is required for transcription. "
            "Install it with `pip install openai-whisper` and ensure ffmpeg is available on PATH."
        ) from exc

    if not hasattr(whisper, "load_model"):
        raise RuntimeError(
            "An incompatible whisper package is installed. "
            "Uninstall the old `whisper` package and install `openai-whisper` instead."
        )

    _MODEL = whisper.load_model(settings.WHISPER_MODEL_NAME)
    return _MODEL


def _sync_transcribe(file_path: str) -> str:
    audio_file = Path(file_path)
    if not audio_file.exists():
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    model = _load_whisper_model()
    result = model.transcribe(str(audio_file))

    text = result.get("text")
    if text is None:
        raise RuntimeError("Transcription failed: no text returned from Whisper")

    return text


async def transcribe_audio(file_path: str) -> str:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _sync_transcribe, file_path)
