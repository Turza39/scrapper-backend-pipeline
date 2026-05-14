from fastapi import APIRouter, HTTPException
from backend.models.schemas import ExtractionRequest, ExtractionResponse, JobStatusResponse, ExtractionResultResponse
from backend.services.extraction_service import ExtractionService

router = APIRouter(prefix="/api", tags=["extraction"])
extraction_service = ExtractionService()

@router.post("/extract", response_model=ExtractionResponse)
async def create_extraction(request: ExtractionRequest):
    """
    Submit a URL for data extraction
    """
    try:
        job_id = await extraction_service.extract_from_url(request.url)
        return ExtractionResponse(job_id=job_id, status="queued")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_extraction_status(job_id: str):
    """
    Get extraction job status
    """
    status = extraction_service.get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(status=status)

@router.get("/result/{job_id}", response_model=ExtractionResultResponse)
async def get_extraction_result(job_id: str):
    """
    Get extraction job result
    """
    result = extraction_service.get_job_result(job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Job not found")
    return result

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}
