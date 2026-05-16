import uuid
from typing import Dict, Any, Optional
from backend.fetchers.fetcher import Fetcher
from backend.extractors.job_extractor import JobPostingExtractor
from backend.validators.validator import JobPostingValidator
from backend.models.schemas import ExtractionResultResponse, JobPostingData

class ExtractionService:
    """Main extraction service orchestrating fetching, extraction, and validation"""
    
    def __init__(self):
        self.fetcher = Fetcher()
        self.extractor = JobPostingExtractor()
        self.validator = JobPostingValidator()
        self.jobs_store: Dict[str, Any] = {}  # In-memory store for MVP
    
    async def extract_from_url(self, url: str) -> str:
        """
        Extract data from URL and return job ID
        """
        job_id = str(uuid.uuid4())
        
        # Store initial job
        self.jobs_store[job_id] = {
            'status': 'processing',
            'url': url,
            'data': None,
            'error': None,
            'source_type': None,
            'confidence': None,
            'missing_fields': [],
        }
        
        # Process extraction (in MVP, this is synchronous for simplicity)
        try:
            self.extractor.reset_state()
            
            # Fetch content
            fetch_result = await self.fetcher.fetch_content(url)
            if not fetch_result:
                self.jobs_store[job_id]['status'] = 'failed'
                self.jobs_store[job_id]['error'] = 'Fetch failed'
                return job_id
            
            # Extract data using the detected content type.
            extracted_data = await self.extractor.extract(fetch_result.content, fetch_result.content_type)
            
            if not extracted_data:
                self.jobs_store[job_id]['status'] = 'failed'
                self.jobs_store[job_id]['error'] = 'Extraction returned no data'
                self.jobs_store[job_id]['source_type'] = self.extractor.source_type
                self.jobs_store[job_id]['confidence'] = self.extractor.confidence
                return job_id
            
            # Validate data
            validated_data, missing_fields = self.validator.validate(extracted_data)
            
            # Store result
            self.jobs_store[job_id]['status'] = 'success'
            self.jobs_store[job_id]['data'] = validated_data
            self.jobs_store[job_id]['missing_fields'] = missing_fields
            self.jobs_store[job_id]['source_type'] = self.extractor.source_type
            self.jobs_store[job_id]['confidence'] = self.extractor.confidence
            
        except Exception as e:
            self.jobs_store[job_id]['status'] = 'failed'
            self.jobs_store[job_id]['error'] = str(e)
            self.jobs_store[job_id]['source_type'] = self.extractor.source_type
            self.jobs_store[job_id]['confidence'] = self.extractor.confidence
        
        return job_id
    
    def get_job_status(self, job_id: str) -> Optional[str]:
        """Get job status"""
        job = self.jobs_store.get(job_id)
        return job['status'] if job else None
    
    def get_job_result(self, job_id: str) -> Optional[ExtractionResultResponse]:
        """Get job result"""
        job = self.jobs_store.get(job_id)
        
        if not job:
            return None
        
        return ExtractionResultResponse(
            status=job['status'],
            source_type=job.get('source_type'),
            confidence=job.get('confidence'),
            data=job.get('data'),
            missing_fields=job.get('missing_fields', []),
            error=job.get('error'),
        )
