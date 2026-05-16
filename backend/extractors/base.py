from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from pydantic import BaseModel

class BaseExtractor(ABC):
    """Base class for all extractors"""

    def __init__(self):
        self.reset_state()

    @abstractmethod
    async def extract(self, content: str, content_type: str = 'html') -> Optional[Dict[str, Any]]:
        """Extract data from content"""
        pass

    def reset_state(self):
        """Reset extractor metadata between extraction runs."""
        self.confidence = 0.0
        self.source_type = 'unknown'

    def set_confidence(self, confidence: float):
        """Set extraction confidence score"""
        self.confidence = max(0.0, min(1.0, confidence))

    def set_source_type(self, source_type: str):
        """Set the source type of extraction"""
        self.source_type = source_type
