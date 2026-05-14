import httpx
import json
from bs4 import BeautifulSoup
from typing import Dict, Any, Optional

class Fetcher:
    def __init__(self, timeout: int = 30):
        self.timeout = timeout
    
    async def fetch_html(self, url: str) -> Optional[str]:
        """Fetch HTML content from URL"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=self.timeout)
                response.raise_for_status()
                return response.text
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    async def fetch_json(self, url: str) -> Optional[Dict[Any, Any]]:
        """Fetch JSON content from URL"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=self.timeout)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error fetching JSON from {url}: {e}")
            return None
    
    def extract_json_from_html(self, html: str) -> Optional[Dict[Any, Any]]:
        """Extract embedded JSON from HTML script tags"""
        try:
            soup = BeautifulSoup(html, 'html.parser')
            scripts = soup.find_all('script', type='application/ld+json')
            
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    return data
                except:
                    continue
            return None
        except Exception as e:
            print(f"Error extracting JSON from HTML: {e}")
            return None
