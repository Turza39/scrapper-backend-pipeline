import httpx
import json
from dataclasses import dataclass
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup

@dataclass
class FetchResult:
    content: str
    content_type: str
    status_code: int

class Fetcher:
    def __init__(self, timeout: int = 30):
        self.timeout = timeout

    async def fetch_content(self, url: str) -> Optional[FetchResult]:
        """Fetch content from URL and detect the response format."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=self.timeout, follow_redirects=True)
                response.raise_for_status()
                text = response.text
                content_type_header = response.headers.get('content-type', '').lower()

                # Debug logging can help diagnose blocked or invalid responses.
                print("FETCH URL:", url)
                print("STATUS:", response.status_code)
                print("CONTENT-TYPE:", content_type_header)
                print("BODY SAMPLE:", text[:200].replace('\n', ' '))

                if not text or len(text.strip()) < 10:
                    return None

                # JSON detection from header
                if 'application/json' in content_type_header or 'text/json' in content_type_header:
                    try:
                        json.loads(text)
                        return FetchResult(content=text, content_type='json', status_code=response.status_code)
                    except json.JSONDecodeError:
                        return FetchResult(content=text, content_type='html', status_code=response.status_code)

                # HTML detection from header
                if 'text/html' in content_type_header or 'application/xhtml+xml' in content_type_header:
                    return FetchResult(content=text, content_type='html', status_code=response.status_code)

                # Fallback detection: first try JSON, then treat as HTML.
                try:
                    json.loads(text)
                    return FetchResult(content=text, content_type='json', status_code=response.status_code)
                except json.JSONDecodeError:
                    if self._is_error_page(text):
                        return FetchResult(content=text, content_type='html', status_code=response.status_code)
                    return FetchResult(content=text, content_type='html', status_code=response.status_code)

        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def _is_error_page(self, text: str) -> bool:
        """Detect common error or blocked response patterns in HTML."""
        keywords = ["404", "not found", "access denied", "captcha", "forbidden"]
        lower_text = text.lower()
        return any(keyword in lower_text for keyword in keywords)

    async def fetch_html(self, url: str) -> Optional[str]:
        """Legacy helper: fetch content as text."""
        result = await self.fetch_content(url)
        return result.content if result else None

    async def fetch_json(self, url: str) -> Optional[Dict[Any, Any]]:
        """Legacy helper: fetch JSON content if available."""
        result = await self.fetch_content(url)
        if not result or result.content_type != 'json':
            return None
        try:
            return json.loads(result.content)
        except json.JSONDecodeError as e:
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
                except Exception:
                    continue
            return None
        except Exception as e:
            print(f"Error extracting JSON from HTML: {e}")
            return None
