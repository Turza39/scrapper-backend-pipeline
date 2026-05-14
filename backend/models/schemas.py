from typing import Optional, Dict, Any, List
from pydantic import BaseModel, HttpUrl
from datetime import datetime

class ExtractionRequest(BaseModel):
    url: str

class JobPostingData(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    skills: Optional[List[str]] = None
    requirements: Optional[str] = None
    work_mode: Optional[str] = None
    experience: Optional[str] = None
    posting_date: Optional[str] = None
    job_description: Optional[str] = None
    
class ExtractionResponse(BaseModel):
    job_id: str
    status: str
    
class JobStatusResponse(BaseModel):
    status: str
    
class ExtractionResultResponse(BaseModel):
    status: str
    source_type: Optional[str] = None
    confidence: Optional[float] = None
    data: Optional[JobPostingData] = None
    missing_fields: List[str] = []
    error: Optional[str] = None
