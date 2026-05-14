from typing import Dict, Any, List, Tuple
from backend.models.schemas import JobPostingData

class JobPostingValidator:
    """Validate extracted job posting data"""
    
    REQUIRED_FIELDS = ['title', 'company']
    OPTIONAL_FIELDS = ['location', 'salary', 'skills', 'requirements', 'work_mode', 
                      'experience', 'posting_date', 'job_description']
    
    def validate(self, data: Dict[str, Any]) -> Tuple[JobPostingData, List[str]]:
        """
        Validate and normalize job posting data
        Returns: (validated_data, missing_fields)
        """
        missing_fields = []
        
        # Check required fields
        for field in self.REQUIRED_FIELDS:
            if not data.get(field):
                missing_fields.append(field)
        
        # Normalize and validate
        normalized = {
            'title': self._validate_string(data.get('title')),
            'company': self._validate_string(data.get('company')),
            'location': self._validate_string(data.get('location')),
            'salary': self._validate_string(data.get('salary')),
            'skills': self._validate_skills(data.get('skills')),
            'requirements': self._validate_string(data.get('requirements')),
            'work_mode': self._validate_work_mode(data.get('work_mode')),
            'experience': self._validate_string(data.get('experience')),
            'posting_date': self._validate_string(data.get('posting_date')),
            'job_description': self._validate_string(data.get('job_description')),
        }
        
        validated_data = JobPostingData(**normalized)
        return validated_data, missing_fields
    
    def _validate_string(self, value: Any) -> str or None:
        """Validate and clean string values"""
        if isinstance(value, str):
            cleaned = value.strip()
            return cleaned if cleaned else None
        return None
    
    def _validate_skills(self, value: Any) -> List[str] or None:
        """Validate skills list"""
        if isinstance(value, list):
            return [s.strip() for s in value if isinstance(s, str) and s.strip()]
        elif isinstance(value, str):
            return [s.strip() for s in value.split(',') if s.strip()]
        return None
    
    def _validate_work_mode(self, value: str) -> str or None:
        """Validate and normalize work mode"""
        if not value:
            return None
        
        modes_map = {
            'remote': ['remote', 'wfh', 'work from home', 'anywhere'],
            'on-site': ['on-site', 'onsite', 'office', 'in-office'],
            'hybrid': ['hybrid', 'mixed'],
        }
        
        value_lower = value.lower().strip()
        for normalized, variants in modes_map.items():
            if value_lower in variants:
                return normalized
        
        return value.strip() if value else None
