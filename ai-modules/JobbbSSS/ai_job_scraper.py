#!/usr/bin/env python3
"""
Enhanced Job Scraper - Uses multiple APIs for real job listings with application support
Prompts user for job role and location, then searches across multiple job platforms
"""
import sys
import os
import urllib.parse
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import re
import time
import json
import webbrowser

# Load environment variables
load_dotenv()


class JobListing:
    """Represents a job listing with all relevant information."""
    def __init__(self, job_title, company_name, location, job_description, salary, website_link, apply_link=None):
        self.job_title = job_title
        self.company_name = company_name
        self.location = location
        self.job_description = job_description
        self.salary = salary
        self.website_link = website_link
        self.apply_link = apply_link or website_link


def load_api_keys():
    """Load API keys from environment."""
    try:
        google_key = os.getenv('GOOGLE_API_KEY')
        rapidapi_key = os.getenv('RAPIDAPI_KEY')
        
        print("🔑 Loading API keys...")
        if google_key:
            print(f"✓ Google API key loaded: {google_key[:10]}...")
        if rapidapi_key:
            print(f"✓ RapidAPI key loaded: {rapidapi_key[:10]}...")
            
        return google_key, rapidapi_key
            
    except Exception as e:
        print(f"❌ Error loading API credentials: {e}")
        return None, None


def get_user_input():
    """Get job role and location from user."""
    print("🚀 Enhanced Job Scraper with Application Support")
    print("=" * 60)
    print()
    
    # Get job role
    while True:
        role = input("🔍 Enter the job role you're looking for: ").strip()
        if role:
            break
        print("Please enter a valid job role.")
    
    # Get location
    location = input("📍 Enter the location (or press Enter for 'Remote/Any'): ").strip()
    if not location:
        location = "Remote"
    
    return role, location


def search_jobs_rapidapi(role, location, rapidapi_key):
    """Search for jobs using RapidAPI JSearch with exact API format."""
    jobs = []
    
    if not rapidapi_key:
        print("❌ RapidAPI key not available")
        return jobs
    
    try:
        print("🔍 Searching with RapidAPI JSearch...")
        
        url = "https://jsearch.p.rapidapi.com/search"
        
        # Create query string - include location if specified
        if location and location.lower() != "remote":
            query = f"{role} jobs in {location}"
        else:
            query = f"{role} jobs"
        
        headers = {
            "x-rapidapi-key": rapidapi_key,
            "x-rapidapi-host": "jsearch.p.rapidapi.com"
        }
        
        params = {
            "query": query,
            "page": "1",
            "num_pages": "1",
            "country": "us",
            "date_posted": "all"
        }
        
        print(f"🔍 Searching: {query}")
        response = requests.get(url, headers=headers, params=params, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'data' in data and data['data']:
                print(f"✅ Found {len(data['data'])} jobs from RapidAPI")
                
                for job_data in data['data'][:15]:  # Limit to 15 jobs
                    try:
                        job = JobListing(
                            job_title=job_data.get('job_title', 'Job Opportunity'),
                            company_name=job_data.get('employer_name', 'Company'),
                            location=f"{job_data.get('job_city', location)}, {job_data.get('job_state', '')}, {job_data.get('job_country', '')}".strip(', '),
                            job_description=job_data.get('job_description', 'Job description not available.')[:400] + "...",
                            salary=format_salary(job_data.get('job_min_salary'), job_data.get('job_max_salary')),
                            website_link=job_data.get('job_apply_link', ''),
                            apply_link=job_data.get('job_apply_link', '')
                        )
                        jobs.append(job)
                        print(f"   📋 Added: {job.job_title} at {job.company_name}")
                    except Exception as e:
                        print(f"   ⚠️ Error processing job: {e}")
                        continue
            else:
                print("⚠️ No jobs found in RapidAPI response")
                if 'error' in data:
                    print(f"❌ API Error: {data['error']}")
        else:
            print(f"⚠️ RapidAPI request failed with status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error with RapidAPI search: {str(e)}")
    
    return jobs


def format_salary(min_salary, max_salary):
    """Format salary range."""
    if min_salary and max_salary:
        return f"${min_salary:,} - ${max_salary:,}"
    elif min_salary:
        return f"From ${min_salary:,}"
    elif max_salary:
        return f"Up to ${max_salary:,}"
    else:
        return "Salary not specified"


def search_jobs_google(role, location, google_key):
    """Search for jobs using Google Custom Search API with better query handling."""
    jobs = []
    
    if not google_key:
        print("❌ Google API key not available")
        return jobs
    
    try:
        print("🌐 Searching with Google Search API...")
        
        # Create more targeted search queries
        location_query = f" {location}" if location and location.lower() != "remote" else ""
        
        # Use broader, more effective search terms
        search_queries = [
            f'{role} jobs',
            f'{role} developer position',
            f'{role} programming job',
            f'software developer {role}',
            f'{role} engineer vacancy'
        ]
        
        base_url = "https://www.googleapis.com/customsearch/v1"
        
        for query in search_queries:
            try:
                params = {
                    'key': google_key,
                    'cx': '017576662512468239146:omuauf_lfve',
                    'q': query,
                    'num': 10,
                    'lr': 'lang_en'
                }
                
                print(f"🔍 Searching: {query}")
                response = requests.get(base_url, params=params, timeout=15)
                
                if response.status_code == 200:
                    search_results = response.json()
                    
                    if 'items' in search_results and search_results['items']:
                        print(f"✅ Found {len(search_results['items'])} results for: {query}")
                        for item in search_results['items']:
                            job_info = extract_job_from_google_result(item, role, location)
                            if job_info:
                                jobs.append(job_info)
                                print(f"   📋 Added: {job_info.job_title} at {job_info.company_name}")
                    else:
                        print(f"⚠️ No items found for query: {query}")
                        # Debug: print what we got
                        if 'searchInformation' in search_results:
                            total_results = search_results['searchInformation'].get('totalResults', '0')
                            print(f"   📊 Total results available: {total_results}")
                        
                elif response.status_code == 403:
                    print("⚠️ Google API quota exceeded or invalid API key")
                    break
                else:
                    print(f"⚠️ Google API error {response.status_code}: {response.text}")
                    
                time.sleep(1)  # Rate limiting
                
            except Exception as e:
                print(f"⚠️ Error with Google query '{query}': {str(e)}")
                continue
        
        # Remove duplicates
        unique_jobs = remove_duplicate_jobs(jobs)
        
        if unique_jobs:
            print(f"✅ Total unique jobs found: {len(unique_jobs)}")
        else:
            print("⚠️ No jobs found from Google Search")
            
        return unique_jobs
            
    except Exception as e:
        print(f"❌ Error during Google search: {str(e)}")
        return jobs


def extract_job_from_google_result(search_item, role, location):
    """Extract job information from Google Search result."""
    try:
        title = search_item.get('title', 'Job Opportunity')
        link = search_item.get('link', '')
        snippet = search_item.get('snippet', 'Job description not available.')
        
        # Skip non-job related results
        job_keywords = ['job', 'career', 'hiring', 'position', 'vacancy', 'employment', 'opportunity', 'opening']
        if not any(keyword in title.lower() or keyword in snippet.lower() for keyword in job_keywords):
            print(f"   ⚠️ Skipping non-job result: {title[:50]}...")
            return None
        
        # Extract company name
        company_name = extract_company_from_title(title)
        if not company_name or company_name == "Company":
            company_name = extract_company_from_url(link)
        
        # Clean job title - make it more relevant to the search
        job_title = clean_job_title(title, role)
        
        # Extract location and salary
        job_location = extract_location_from_snippet(snippet, location)
        salary = extract_salary_from_snippet(snippet)
        
        # Create job listing
        job = JobListing(
            job_title=job_title,
            company_name=company_name,
            location=job_location,
            job_description=snippet[:300] + "..." if len(snippet) > 300 else snippet,
            salary=salary,
            website_link=link,
            apply_link=link
        )
        
        return job
        
    except Exception as e:
        print(f"⚠️ Error extracting job info: {str(e)}")
        return None


def extract_company_from_title(title):
    """Extract company name from job title."""
    patterns = [
        r'at\s+([^-|\n]+)',
        r'-\s+([^|\n]+)',
        r'\|\s+([^-\n]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            company = match.group(1).strip()
            if 2 < len(company) < 50:
                return company
    
    return "Company"


def extract_company_from_url(url):
    """Extract company name from URL."""
    try:
        if 'linkedin.com' in url:
            return "LinkedIn"
        elif 'indeed.com' in url:
            return "Indeed"
        elif 'glassdoor.com' in url:
            return "Glassdoor"
        else:
            from urllib.parse import urlparse
            domain = urlparse(url).netloc
            return domain.replace('www.', '').replace('.com', '').title()
    except:
        return "Company"


def extract_location_from_snippet(snippet, default_location):
    """Extract location from job snippet."""
    location_patterns = [
        r'(\w+,\s*\w{2})',
        r'(\w+,\s*\w+)',
        r'(Remote)',
        r'(Work from home)',
    ]
    
    for pattern in location_patterns:
        match = re.search(pattern, snippet, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return default_location


def extract_salary_from_snippet(snippet):
    """Extract salary from job snippet."""
    salary_patterns = [
        r'\$[\d,]+\s*-\s*\$[\d,]+',
        r'\$[\d,]+k?\s*per\s*year',
        r'[\d,]+k\s*-\s*[\d,]+k'
    ]
    
    for pattern in salary_patterns:
        match = re.search(pattern, snippet, re.IGNORECASE)
        if match:
            return match.group(0)
    
    return "Salary not specified"


def clean_job_title(title, role):
    """Clean and format job title."""
    title = re.sub(r'\s*-\s*.*$', '', title)
    title = re.sub(r'^\s*.*?\|\s*', '', title)
    
    if len(title) > 80 or role.lower() not in title.lower():
        return f"{role.title()} Position"
    
    return title[:70]


def generate_sample_jobs(role, location):
    """Generate sample jobs when APIs fail."""
    print(f"📝 Generating sample {role} jobs for {location}...")
    
    companies = [
        {"name": "Google", "url": "https://careers.google.com"},
        {"name": "Microsoft", "url": "https://careers.microsoft.com"},
        {"name": "Amazon", "url": "https://amazon.jobs"},
        {"name": "Apple", "url": "https://jobs.apple.com"},
        {"name": "Meta", "url": "https://www.metacareers.com"},
        {"name": "Netflix", "url": "https://jobs.netflix.com"},
        {"name": "Tesla", "url": "https://www.tesla.com/careers"},
        {"name": "Spotify", "url": "https://www.lifeatspotify.com"}
    ]
    
    levels = ["Junior", "Mid-level", "Senior", "Lead"]
    salaries = ["$70k-90k", "$90k-130k", "$130k-180k", "$180k-250k"]
    
    jobs = []
    for i, company in enumerate(companies):
        level = levels[i % len(levels)]
        salary = salaries[i % len(salaries)]
        
        job = JobListing(
            job_title=f"{level} {role.title()}",
            company_name=company["name"],
            location=location,
            job_description=f"Join {company['name']} as a {role} and work on cutting-edge technology with a world-class team. Great benefits and growth opportunities.",
            salary=salary,
            website_link=f"{company['url']}?q={role.replace(' ', '+')}",
            apply_link=f"{company['url']}?q={role.replace(' ', '+')}"
        )
        jobs.append(job)
    
    return jobs


def scrape_jobs(role, location):
    """Main job scraping function using RapidAPI JSearch only."""
    print(f"\n🔍 Searching for '{role}' jobs in '{location}'...")
    print("Please wait while we search using RapidAPI JSearch...\n")
    
    # Load API keys
    google_key, rapidapi_key = load_api_keys()
    
    all_jobs = []
    
    # Only use RapidAPI JSearch
    if rapidapi_key:
        rapidapi_jobs = search_jobs_rapidapi(role, location, rapidapi_key)
        all_jobs.extend(rapidapi_jobs)
    else:
        print("❌ No RapidAPI key found. Please add RAPIDAPI_KEY to your .env file")
        return []
    
    # Remove duplicates
    unique_jobs = remove_duplicate_jobs(all_jobs)
    
    if not unique_jobs:
        print("❌ No jobs found from RapidAPI JSearch.")
        print("💡 Try different search terms or check your API key and quota.")
        return []
    
    print(f"✅ Successfully found {len(unique_jobs)} unique job listings!")
    return unique_jobs[:15]  # Limit to 15 jobs


def remove_duplicate_jobs(jobs):
    """Remove duplicate jobs based on company and title."""
    seen = set()
    unique_jobs = []
    
    for job in jobs:
        key = (job.company_name.lower(), job.job_title.lower())
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)
    
    return unique_jobs


def display_results(jobs, role, location):
    """Display job search results with enhanced formatting."""
    print(f"\n" + "="*70)
    print(f"🎯 JOB SEARCH RESULTS")
    print(f"="*70)
    print(f"🔍 Search Query: {role}")
    print(f"📍 Location: {location}")
    print(f"📊 Total Jobs Found: {len(jobs)}")
    print(f"📅 Search Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"="*70)
    
    if not jobs:
        print("❌ No jobs found. Please try a different search term or location.")
        return
    
    for i, job in enumerate(jobs, 1):
        print(f"\n📋 JOB #{i}")
        print(f"├─ 🏢 Company: {job.company_name}")
        print(f"├─ 💼 Role: {job.job_title}")
        print(f"├─ 📍 Location: {job.location}")
        print(f"├─ 💰 Salary: {job.salary}")
        print(f"├─ 📝 Description: {job.job_description[:200]}{'...' if len(job.job_description) > 200 else ''}")
        print(f"└─ 🔗 Apply: {job.apply_link}")
        
        if i < len(jobs):
            print("─" * 70)


def application_helper(jobs):
    """Help user apply to jobs."""
    if not jobs:
        return
    
    print(f"\n🚀 APPLICATION HELPER")
    print("=" * 50)
    
    while True:
        try:
            choice = input(f"\nSelect a job to apply (1-{len(jobs)}) or 'q' to quit: ").strip().lower()
            
            if choice == 'q':
                break
            
            job_num = int(choice)
            if 1 <= job_num <= len(jobs):
                selected_job = jobs[job_num - 1]
                handle_job_application(selected_job)
            else:
                print("Invalid selection. Please try again.")
                
        except ValueError:
            print("Please enter a valid number or 'q' to quit.")
        except KeyboardInterrupt:
            print("\n👋 Application helper closed.")
            break


def handle_job_application(job):
    """Handle application for a specific job."""
    print(f"\n🎯 APPLYING TO: {job.job_title} at {job.company_name}")
    print("=" * 60)
    
    print(f"📝 Job Details:")
    print(f"   Company: {job.company_name}")
    print(f"   Position: {job.job_title}")
    print(f"   Location: {job.location}")
    print(f"   Salary: {job.salary}")
    
    print(f"\n🔗 Application Options:")
    print(f"1. Open application page in browser")
    print(f"2. Copy application link")
    print(f"3. Get application tips")
    print(f"4. Back to job list")
    
    choice = input("\nSelect an option (1-4): ").strip()
    
    if choice == '1':
        try:
            webbrowser.open(job.apply_link)
            print(f"✅ Opened {job.company_name} application page in your browser!")
        except Exception as e:
            print(f"❌ Could not open browser: {e}")
            print(f"🔗 Application Link: {job.apply_link}")
    
    elif choice == '2':
        print(f"📋 Application link copied to display:")
        print(f"🔗 {job.apply_link}")
    
    elif choice == '3':
        show_application_tips(job)
    
    elif choice == '4':
        return
    
    else:
        print("Invalid option selected.")


def show_application_tips(job):
    """Show application tips for the job."""
    print(f"\n💡 APPLICATION TIPS FOR {job.company_name}")
    print("=" * 50)
    
    tips = [
        "✅ Tailor your resume to match the job requirements",
        "✅ Research the company culture and values",
        "✅ Prepare specific examples of your relevant experience",
        "✅ Write a compelling cover letter addressing their needs",
        "✅ Follow up 1-2 weeks after applying",
        "✅ Practice common interview questions for this role",
        "✅ Prepare questions to ask about the role and company"
    ]
    
    for tip in tips:
        print(f"   {tip}")
    
    # Company-specific tips
    company_tips = {
        "Google": "Focus on problem-solving and scalability in your examples",
        "Microsoft": "Emphasize collaboration and growth mindset",
        "Amazon": "Highlight customer obsession and ownership principles",
        "Apple": "Show attention to detail and user-focused thinking",
        "Meta": "Demonstrate impact and boldness in your projects"
    }
    
    if job.company_name in company_tips:
        print(f"\n🎯 {job.company_name}-specific tip:")
        print(f"   💡 {company_tips[job.company_name]}")


def save_results(jobs, role, location):
    """Save search results to file."""
    if not jobs:
        return
    
    save = input(f"\n💾 Save these {len(jobs)} jobs to file? (y/n): ").strip().lower()
    
    if save in ['y', 'yes']:
        os.makedirs('data', exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"data/jobs_{role.replace(' ', '_')}_{location.replace(' ', '_')}_{timestamp}.txt"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"Enhanced Job Search Results\n")
                f.write(f"="*50 + "\n")
                f.write(f"Search Query: {role}\n")
                f.write(f"Location: {location}\n")
                f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Total Jobs: {len(jobs)}\n")
                f.write("="*50 + "\n\n")
                
                for i, job in enumerate(jobs, 1):
                    f.write(f"JOB #{i}\n")
                    f.write(f"Company: {job.company_name}\n")
                    f.write(f"Role: {job.job_title}\n")
                    f.write(f"Location: {job.location}\n")
                    f.write(f"Salary: {job.salary}\n")
                    f.write(f"Description: {job.job_description}\n")
                    f.write(f"Apply Link: {job.apply_link}\n")
                    f.write("-" * 50 + "\n")
            
            print(f"✅ Results saved to: {filename}")
        
        except Exception as e:
            print(f"❌ Error saving file: {e}")


def main():
    """Main application entry point."""
    try:
        print("🚀 Starting Enhanced Job Scraper...")
        
        # Get user input
        role, location = get_user_input()
        
        # Search for jobs
        jobs = scrape_jobs(role, location)
        
        # Display results
        display_results(jobs, role, location)
        
        # Application helper
        if jobs:
            use_helper = input(f"\n🚀 Use application helper? (y/n): ").strip().lower()
            if use_helper in ['y', 'yes']:
                application_helper(jobs)
        
        # Save results
        save_results(jobs, role, location)
        
        print(f"\n🎉 Job search completed! Good luck with your applications!")
        
    except KeyboardInterrupt:
        print(f"\n\n👋 Search cancelled by user.")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        print("Please check your API keys and try again.")


if __name__ == '__main__':
    main()
