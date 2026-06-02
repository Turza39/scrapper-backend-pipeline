from __future__ import annotations

import asyncio
import shutil
import uuid
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from core.config import settings
from core.transcriber import transcribe_audio

router = APIRouter()

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

sessions: Dict[str, Dict[str, Any]] = {}


class UploadResult(BaseModel):
    session_id: str
    filename: str
    size: int
    status: str


class ProcessOptions(BaseModel):
    chunk_size_seconds: int = 5
    enable_diarization: bool = False
    enable_event_extraction: bool = False


class ProcessResponse(BaseModel):
    status: str


class StatusResponse(BaseModel):
    session_id: str
    status: str


@router.post("/upload", response_model=UploadResult)
async def upload_file(file: UploadFile = File(...)) -> UploadResult:
    session_id = uuid.uuid4().hex
    filename = file.filename
    stored_name = f"{session_id}_{filename}"
    destination = UPLOAD_DIR / stored_name

    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not save uploaded file: {exc}")
    finally:
        await file.close()

    sessions[session_id] = {
        "session_id": session_id,
        "filename": filename,
        "stored_name": stored_name,
        "path": str(destination),
        "size": destination.stat().st_size,
        "status": "uploaded",
        "transcript": None,
    }

    return UploadResult(
        session_id=session_id,
        filename=filename,
        size=sessions[session_id]["size"],
        status="uploaded",
    )


@router.post("/process/{session_id}", response_model=ProcessResponse)
async def process_file(session_id: str, options: ProcessOptions) -> ProcessResponse:
    session = sessions.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["status"] == "processing":
        return ProcessResponse(status="processing")

    session["status"] = "processing"

    try:
        transcript = await transcribe_audio(session["path"])
        session["transcript"] = transcript
        session["status"] = "completed"
        return ProcessResponse(status="completed")
    except Exception as exc:
        session["status"] = "error"
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/status/{session_id}", response_model=StatusResponse)
def get_status(session_id: str) -> StatusResponse:
    session = sessions.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return StatusResponse(session_id=session_id, status=session["status"])


@router.get("/transcript/{session_id}")
def get_transcript(session_id: str):
    session = sessions.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"session_id": session_id, "transcript": session.get("transcript")}


@router.websocket("/stream/{session_id}")
async def stream_transcript(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()

    session = sessions.get(session_id)
    if session is None:
        await websocket.close(code=1008)
        return

    if session["status"] not in {"completed", "processing"}:
        await websocket.send_json(
            {
                "type": "pipeline_step",
                "data": {"step": "chunking", "status": "running"},
            }
        )
        await websocket.send_json(
            {
                "type": "pipeline_step",
                "data": {"step": "transcription", "status": "running"},
            }
        )

    for _ in range(20):
        if session["status"] == "completed":
            break
        if session["status"] == "error":
            await websocket.close(code=1011)
            return
        await asyncio.sleep(0.25)

    transcript = session.get("transcript")
    if not transcript:
        await websocket.close(code=1011)
        return

    try:
        await websocket.send_json(
            {
                "type": "transcription_chunk",
                "timestamp": "00:00:00",
                "chunk_index": 0,
                "segments": [{"speaker": "Speaker 1", "text": transcript}],
            }
        )
        await websocket.send_json(
            {
                "type": "pipeline_step",
                "data": {"step": "transcription", "status": "done"},
            }
        )
        await websocket.send_json(
            {
                "type": "pipeline_step",
                "data": {"step": "complete", "status": "done"},
            }
        )
    except WebSocketDisconnect:
        return
    finally:
        await websocket.close()
