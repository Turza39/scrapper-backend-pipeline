import re
import json
from typing import Optional, Dict, Any, List
from bs4 import BeautifulSoup
from .base import BaseExtractor

class JobPostingExtractor(BaseExtractor):
    """Extract job posting data from HTML/JSON"""
    
    def __init__(self):
        super().__init__()
        self.source_type = "html"
    
    async def extract(self, content: str) -> Optional[Dict[str, Any]]:
        """Extract job posting data"""
        try:
            # Try JSON first
            try:
                data = json.loads(content)
                if self._is_job_schema(data):
                    self.set_source_type("json")
                    self.set_confidence(0.95)
                    return self._normalize_job_data(data)
            except:
                pass
            
            # Fall back to HTML parsing
            soup = BeautifulSoup(content, 'html.parser')
            extracted = self._extract_from_html(soup)
            
            if extracted:
                self.set_confidence(0.70)
                return extracted
            
            return None
        except Exception as e:
            print(f"Error in job extraction: {e}")
            return None
    
    def _is_job_schema(self, data: Dict) -> bool:
        """Check if JSON is a job posting schema"""
        if isinstance(data, dict):
            type_field = data.get('@type') or data.get('type')
            if type_field and 'JobPosting' in str(type_field):
                return True
        return False
    
    def _normalize_job_data(self, data: Dict) -> Dict[str, Any]:
        """Normalize job data from schema"""
        return {
            'title': data.get('title') or data.get('jobTitle'),
            'company': self._extract_company(data),
            'location': self._extract_location(data),
            'salary': self._extract_salary(data),
            'skills': self._extract_skills(data),
            'requirements': data.get('qualifications') or data.get('requirements'),
            'work_mode': self._extract_work_mode(data),
            'experience': data.get('experienceRequirements'),
            'posting_date': data.get('datePosted'),
            'job_description': data.get('description') or data.get('jobDescription'),
        }
    
    def _extract_from_html(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract job data from HTML"""
        return {
            'title': self._extract_title(soup),
            'company': self._extract_company_from_html(soup),
            'location': self._extract_location_from_html(soup),
            'salary': self._extract_salary_from_html(soup),
            'skills': self._extract_skills_from_html(soup),
            'requirements': self._extract_requirements_from_html(soup),
            'work_mode': self._extract_work_mode_from_html(soup),
            'experience': None,
            'posting_date': None,
            'job_description': self._extract_description_from_html(soup),
        }
    
    def _extract_title(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract job title"""
        # Try common selectors
        selectors = ['h1', 'h2', '[data-job-title]', '.job-title']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)
        return None
    
    def _extract_company(self, data: Dict) -> Optional[str]:
        """Extract company from schema"""
        if 'hiringOrganization' in data:
            org = data['hiringOrganization']
            if isinstance(org, dict):
                return org.get('name')
            return str(org)
        return data.get('company')
    
    def _extract_company_from_html(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract company from HTML"""
        selectors = ['[data-company]', '.company', '.employer', '[itemprop="hiringOrganization"]']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)
        return None
    
    def _extract_location(self, data: Dict) -> Optional[str]:
        """Extract location from schema"""
        if 'jobLocation' in data:
            loc = data['jobLocation']
            if isinstance(loc, dict):
                address = loc.get('address', {})
                if isinstance(address, dict):
                    return f"{address.get('addressLocality')}, {address.get('addressCountry')}"
        return data.get('location')
    
    def _extract_location_from_html(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract location from HTML"""
        selectors = ['[data-location]', '.location', '[itemprop="jobLocation"]']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)
        return None
    
    def _extract_salary(self, data: Dict) -> Optional[str]:
        """Extract salary from schema"""
        if 'baseSalary' in data:
            salary = data['baseSalary']
            if isinstance(salary, dict):
                return salary.get('currency', '') + ' ' + str(salary.get('value', ''))
        return data.get('salary')
    
    def _extract_salary_from_html(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract salary from HTML"""
        selectors = ['[data-salary]', '.salary', '[itemprop="baseSalary"]']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)
        return None
    
    def _extract_skills(self, data: Dict) -> Optional[List[str]]:
        """Extract skills from schema"""
        skills_field = data.get('skills') or data.get('applicantRequiredSkills', [])
        if isinstance(skills_field, list):
            return skills_field
        elif isinstance(skills_field, str):
            return [s.strip() for s in skills_field.split(',')]
        return None
    
    def _extract_skills_from_html(self, soup: BeautifulSoup) -> Optional[List[str]]:
        """Extract skills from HTML"""
        skills_container = soup.select_one('[data-skills], .skills, .requirements')
        if skills_container:
            skill_items = skills_container.select('[data-skill], .skill, li')
            return [item.get_text(strip=True) for item in skill_items[:10]]
        return None
    
    def _extract_requirements_from_html(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract requirements from HTML"""
        selectors = ['[data-requirements]', '.requirements', '.qualifications']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)
        return None
    
    def _extract_work_mode(self, data: Dict) -> Optional[str]:
        """Extract work mode from schema"""
        return data.get('employmentType') or data.get('workMode')
    
    def _extract_work_mode_from_html(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract work mode from HTML"""
        selectors = ['[data-work-mode]', '.work-mode', '[itemprop="employmentType"]']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)
        return None
    
    def _extract_description_from_html(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract job description from HTML"""
        selectors = ['[data-description]', '.description', '.job-description', 'article', '[itemprop="description"]']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)[:500]
        return None
