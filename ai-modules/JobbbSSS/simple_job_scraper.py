"""
Simple job scraper wrapper for backend integration
"""

from ai_job_scraper import scrape_jobs, JobListing

class AIJobScraper:
    """Wrapper class for the job scraper functionality"""
    
    def __init__(self):
        pass
    
    def search_jobs(self, query=None, location="Remote", role=None):
        """Search for jobs using the query/role and location"""
        try:
            # Use either query or role parameter
            search_term = query or role or "software developer"
            
            print(f"🔍 Searching for: {search_term} in {location}")
            jobs = scrape_jobs(search_term, location)
            
            # Convert JobListing objects to dictionaries for JSON serialization
            job_dicts = []
            for job in jobs:
                job_dict = {
                    'job_title': job.job_title,
                    'company_name': job.company_name,
                    'location': job.location,
                    'job_description': job.job_description,
                    'salary': job.salary,
                    'website_link': job.website_link,
                    'apply_link': job.apply_link
                }
                job_dicts.append(job_dict)
            
            # Return in the format expected by the backend
            return {
                'jobs': job_dicts,
                'total_found': len(job_dicts),
                'search_query': search_term,
                'search_location': location
            }
            
        except Exception as e:
            print(f"Error in job search: {e}")
            return {
                'jobs': [],
                'total_found': 0,
                'error': str(e)
            }
