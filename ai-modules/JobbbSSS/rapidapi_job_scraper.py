#!/usr/bin/env python3
"""
AI Job Scraper Class Wrapper for API Integration
This wraps the job scraper functionality into a class that can be used by the Flask API
"""

import sys
import os
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AIJobScraper:
    """AI Job Scraper class for API integration"""
    
    def __init__(self):
        self.rapidapi_key = os.getenv('RAPIDAPI_KEY')
        self.google_key = os.getenv('GOOGLE_API_KEY')
        
    def search_jobs(self, query, location="Remote"):
        """
        Search for jobs using RapidAPI and return structured data
        Expected format for UI integration
        """
        try:
            print(f"🔍 Searching for '{query}' jobs in '{location}'...")
            
            if not self.rapidapi_key:
                print("❌ RAPIDAPI_KEY not found in environment")
                return {
                    'success': False,
                    'error': 'API key not configured',
                    'jobs': [],
                    'total_found': 0
                }
            
            # Search using RapidAPI
            jobs = self._search_jobs_rapidapi(query, location)
            
            if not jobs:
                # Generate sample jobs if API fails
                jobs = self._generate_sample_jobs(query, location)
            
            return {
                'success': True,
                'jobs': jobs,
                'total_found': len(jobs),
                'search_query': query,
                'search_location': location,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Job search error: {e}")
            return {
                'success': False,
                'error': str(e),
                'jobs': [],
                'total_found': 0
            }

    
    def _search_jobs_rapidapi(self, query, location):
        """Search jobs using RapidAPI JSearch"""
        jobs = []
        
        try:
            print("🔍 Searching with RapidAPI JSearch...")
            
            url = "https://jsearch.p.rapidapi.com/search"
            
            search_query = f"{query} {location}".strip()
            
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
            }
            
            params = {
                "query": search_query,
                "page": "1",
                "num_pages": "1",
                "date_posted": "all"
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'data' in data and data['data']:
                    print(f"✅ Found {len(data['data'])} jobs from RapidAPI")
                    
                    for job_data in data['data'][:10]:  # Limit to 10 jobs
                        job = {
                            'id': job_data.get('job_id', f"job_{len(jobs) + 1}"),
                            'title': job_data.get('job_title', 'Job Opportunity'),
                            'company': job_data.get('employer_name', 'Company'),
                            'location': f"{job_data.get('job_city', location)}, {job_data.get('job_country', '')}".strip(', '),
                            'description': self._clean_description(job_data.get('job_description', '')),
                            'salary': self._format_salary(job_data.get('job_min_salary'), job_data.get('job_max_salary')),
                            'url': self._validate_url(job_data.get('job_apply_link', '')),
                            'apply_link': self._validate_url(job_data.get('job_apply_link', '')),
                            'job_type': job_data.get('job_employment_type', 'Full-time'),
                            'posted_date': job_data.get('job_posted_at_datetime_utc', ''),
                            'source': 'RapidAPI',
                            'logo': job_data.get('employer_logo', ''),
                            'experience_level': self._extract_experience_level(job_data.get('job_title', '')),
                            'skills': self._extract_skills_from_description(job_data.get('job_description', ''))
                        }
                        jobs.append(job)
                else:
                    print("⚠️ No jobs found in RapidAPI response")
            else:
                print(f"⚠️ RapidAPI request failed with status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error with RapidAPI search: {str(e)}")
        
        return jobs
    
    def _format_salary(self, min_salary, max_salary):
        """Format salary range"""
        if min_salary and max_salary:
            return f"${min_salary:,} - ${max_salary:,}"
        elif min_salary:
            return f"From ${min_salary:,}"
        elif max_salary:
            return f"Up to ${max_salary:,}"
        else:
            return "Salary not specified"
    
    def _clean_description(self, description):
        """Clean and truncate job description"""
        if not description:
            return "Job description not available."
        
        # Remove HTML tags and extra whitespace
        import re
        clean_desc = re.sub(r'<[^>]+>', '', description)
        clean_desc = re.sub(r'\s+', ' ', clean_desc).strip()
        
        # Truncate to reasonable length
        if len(clean_desc) > 300:
            clean_desc = clean_desc[:300] + "..."
        
        return clean_desc
    
    def _extract_experience_level(self, title):
        """Extract experience level from job title"""
        title_lower = title.lower()
        if any(word in title_lower for word in ['senior', 'sr.', 'lead', 'principal', 'staff']):
            return 'Senior'
        elif any(word in title_lower for word in ['junior', 'jr.', 'entry', 'graduate', 'intern']):
            return 'Junior'
        else:
            return 'Mid-level'
    
    def _extract_skills_from_description(self, description):
        """Extract skills from job description"""
        if not description:
            return []
        
        # Common tech skills to look for
        common_skills = [
            'python', 'javascript', 'react', 'node.js', 'aws', 'docker', 'kubernetes', 
            'sql', 'mongodb', 'postgresql', 'git', 'linux', 'java', 'typescript',
            'angular', 'vue.js', 'express', 'django', 'flask', 'spring', 'redis',
            'elasticsearch', 'jenkins', 'terraform', 'ansible', 'graphql', 'rest api'
        ]
        
        description_lower = description.lower()
        found_skills = []
        
        for skill in common_skills:
            if skill in description_lower:
                found_skills.append(skill.title())
        
        return found_skills[:8]  # Limit to 8 skills
    
    def _validate_url(self, url):
        """Validate and clean URL to prevent white page issues"""
        if not url:
            return ''
        
        # Remove any extra spaces or newlines
        url = url.strip()
        
        # Check if URL starts with http/https
        if not url.startswith(('http://', 'https://')):
            if url.startswith('//'):
                url = 'https:' + url
            elif url.startswith('www.'):
                url = 'https://' + url
            elif url and not url.startswith('#'):
                url = 'https://' + url
        
        # Basic URL validation
        if len(url) > 2000:  # URLs shouldn't be too long
            return ''
        
        # Check for potentially problematic characters
        if any(char in url for char in ['"', "'", '<', '>', '\n', '\r']):
            return ''
        
        return url
    
    def _generate_sample_jobs(self, query, location):
        """Generate sample jobs when API fails"""
        print(f"📝 Generating sample {query} jobs for {location}...")
        
        companies = [
            {"name": "Google", "url": "https://careers.google.com", "logo": "https://logo.clearbit.com/google.com"},
            {"name": "Microsoft", "url": "https://careers.microsoft.com", "logo": "https://logo.clearbit.com/microsoft.com"},
            {"name": "Amazon", "url": "https://amazon.jobs", "logo": "https://logo.clearbit.com/amazon.com"},
            {"name": "Apple", "url": "https://jobs.apple.com", "logo": "https://logo.clearbit.com/apple.com"},
            {"name": "Meta", "url": "https://www.metacareers.com", "logo": "https://logo.clearbit.com/meta.com"},
            {"name": "Netflix", "url": "https://jobs.netflix.com", "logo": "https://logo.clearbit.com/netflix.com"},
            {"name": "Tesla", "url": "https://www.tesla.com/careers", "logo": "https://logo.clearbit.com/tesla.com"},
            {"name": "Spotify", "url": "https://www.lifeatspotify.com", "logo": "https://logo.clearbit.com/spotify.com"}
        ]
        
        levels = ["Junior", "Mid-level", "Senior", "Lead"]
        salaries = ["$70k-90k", "$90k-130k", "$130k-180k", "$180k-250k"]
        
        jobs = []
        for i, company in enumerate(companies):
            level = levels[i % len(levels)]
            salary = salaries[i % len(salaries)]
            
            job = {
                'id': f"sample_{i + 1}",
                'title': f"{level} {query.title()}",
                'company': company["name"],
                'location': location,
                'description': f"Join {company['name']} as a {query} and work on cutting-edge technology with a world-class team. Great benefits and growth opportunities. This is a sample job listing for demonstration purposes.",
                'salary': salary,
                'url': self._validate_url(f"{company['url']}?q={query.replace(' ', '+')}"),
                'apply_link': self._validate_url(f"{company['url']}?q={query.replace(' ', '+')}"),
                'job_type': 'Full-time',
                'posted_date': datetime.now().isoformat(),
                'source': 'Sample Data',
                'logo': company.get('logo', ''),
                'experience_level': level,
                'skills': ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker'][:4]
            }
            jobs.append(job)
        
        return jobs


# For backward compatibility
def search_jobs(query, location="Remote"):
    """Function wrapper for backward compatibility"""
    scraper = AIJobScraper()
    return scraper.search_jobs(query, location)


if __name__ == '__main__':
    # Test the scraper
    scraper = AIJobScraper()
    result = scraper.search_jobs("software engineer", "San Francisco")
    print(f"✅ Test completed: Found {result['total_found']} jobs")
