"""
Kaggle Dataset Loader for AI Impact on Job Market (2024-2030)
Loads and caches the dataset for efficient querying
"""

import os
import pandas as pd
import kagglehub
from kagglehub import KaggleDatasetAdapter
from typing import Optional, Dict, Any
import json
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
env_local = Path(__file__).parent.parent.parent / '.env.local'
if env_local.exists():
    load_dotenv(env_local)
else:
    load_dotenv(Path(__file__).parent.parent.parent / '.env')

class JobMarketDataLoader:
    """Loads and queries the Kaggle AI impact dataset"""
    
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.dataset_id = "sahilislam007/ai-impact-on-job-market-20242030"
        # Store cache in the python directory for persistence
        self.cache_dir = Path(__file__).parent / "data"
        self.cache_dir.mkdir(exist_ok=True)
        self.cache_file = str(self.cache_dir / "job_market_data_cache.csv")
        
    def load_dataset(self, force_refresh: bool = False) -> pd.DataFrame:
        """
        Load the dataset from Kaggle or cache
        
        Args:
            force_refresh: Force download from Kaggle even if cache exists
            
        Returns:
            DataFrame with job market data
        """
        # Check if cached version exists
        if os.path.exists(self.cache_file) and not force_refresh:
            cache_age_days = (Path(self.cache_file).stat().st_mtime - Path().stat().st_mtime) / 86400
            print(f"Loading dataset from cache (cached {abs(int(cache_age_days))} days ago)...")
            print(f"   Cache location: {self.cache_file}")
            self.df = pd.read_csv(self.cache_file)
            print(f"   Loaded {len(self.df)} jobs from cache")
            return self.df
        
        print("Downloading dataset from Kaggle...")
        print("   This is a one-time download, will be cached for future use.")
        try:
            # Download dataset to local directory
            dataset_path = kagglehub.dataset_download(self.dataset_id)
            print(f"   Dataset downloaded to: {dataset_path}")
            
            # Find CSV file in the downloaded directory
            csv_files = list(Path(dataset_path).glob("*.csv"))
            if csv_files:
                print(f"   Found {len(csv_files)} CSV file(s)")
                # Load the first CSV file
                self.df = pd.read_csv(csv_files[0])
            else:
                raise FileNotFoundError("No CSV files found in downloaded dataset")
            
            # Cache for future use
            self.df.to_csv(self.cache_file, index=False)
            print(f"   Dataset downloaded and cached to:")
            print(f"      {self.cache_file}")
            print(f"   Cached {len(self.df)} jobs for future use")
            
        except Exception as e:
            print(f"Error loading from Kaggle: {e}")
            print("   Using fallback data structure...")
            # Fallback: create sample data structure if download fails
            self.df = self._create_fallback_data()
            # Cache fallback data too
            self.df.to_csv(self.cache_file, index=False)
            print(f"   💾 Fallback data cached to {self.cache_file}")
            
        return self.df
    
    def _create_fallback_data(self) -> pd.DataFrame:
        """Create fallback data if Kaggle download fails"""
        print("Using fallback data structure...")
        return pd.DataFrame({
            'Job_Title': ['Software Developer', 'Accountant', 'Electrician', 
                         'Graphic Designer', 'Nurse', 'Teacher'],
            'Industry': ['Technology', 'Finance', 'Construction', 
                        'Creative', 'Healthcare', 'Education'],
            'AI_Automation_Risk': [15, 75, 10, 35, 20, 25],  # Percentage
            'Job_Growth_Projection': [25, -15, 20, 10, 30, 15],  # Percentage
            'Required_Skills_Adaptation': ['High', 'Critical', 'Low', 
                                          'Medium', 'Medium', 'Medium'],
            'Average_Salary_2024': [95000, 65000, 55000, 52000, 75000, 48000],
            'Projected_Salary_2030': [120000, 55000, 70000, 60000, 90000, 52000],
        })
    
    def get_job_data(self, job_title: str, industry: Optional[str] = None) -> Dict[str, Any]:
        """
        Get AI impact data for a specific job
        
        Args:
            job_title: Job title to query
            industry: Optional industry filter
            
        Returns:
            Dictionary with job data and AI impact metrics
        """
        if self.df is None:
            self.load_dataset()
        
        # Normalize job title for matching
        job_title_lower = job_title.lower()
        
        # Handle both column name formats (with/without space)
        job_col = 'Job Title' if 'Job Title' in self.df.columns else 'Job_Title'
        
        # Try exact match first
        matches = self.df[self.df[job_col].str.lower() == job_title_lower]
        
        # If no exact match, try partial match
        if matches.empty:
            matches = self.df[self.df[job_col].str.lower().str.contains(job_title_lower, na=False)]
        
        # If still no match, find closest by industry
        if matches.empty and industry:
            matches = self.df[self.df['Industry'].str.lower() == industry.lower()]
            if not matches.empty:
                matches = matches.head(1)  # Take first match in industry
        
        # If still nothing, return average/default data
        if matches.empty:
            return self._get_default_data(job_title, industry)
        
        # Get the best match (first row if multiple)
        job_data = matches.iloc[0]
        
        # Map column names (handle both formats)
        def get_value(row, new_name, old_name, default):
            if new_name in row:
                return row[new_name]
            elif old_name in row:
                return row[old_name]
            return default
        
        # Calculate growth projection from openings
        openings_2024 = get_value(job_data, 'Job Openings (2024)', 'Job_Openings_2024', 100)
        openings_2030 = get_value(job_data, 'Projected Openings (2030)', 'Projected_Openings_2030', 100)
        growth_projection = ((openings_2030 - openings_2024) / openings_2024 * 100) if openings_2024 > 0 else 0
        
        return {
            'job_title': str(get_value(job_data, 'Job Title', 'Job_Title', job_title)),
            'industry': str(get_value(job_data, 'Industry', 'Industry', industry or 'Unknown')),
            'ai_automation_risk': float(get_value(job_data, 'Automation Risk (%)', 'AI_Automation_Risk', 50)),
            'job_growth_projection': float(growth_projection),
            'required_skills_adaptation': str(get_value(job_data, 'Required Education', 'Required_Skills_Adaptation', 'Medium')),
            'ai_impact_level': str(get_value(job_data, 'AI Impact Level', 'AI_Impact_Level', 'Moderate')),
            'avg_salary_2024': float(get_value(job_data, 'Median Salary (USD)', 'Average_Salary_2024', 60000)),
            'projected_salary_2030': float(get_value(job_data, 'Median Salary (USD)', 'Projected_Salary_2030', 65000)),
            'data_source': 'kaggle',
            'confidence': 'high' if not matches.empty else 'low'
        }
    
    def _get_default_data(self, job_title: str, industry: Optional[str]) -> Dict[str, Any]:
        """Return default data if no match found"""
        return {
            'job_title': job_title,
            'industry': industry or 'Unknown',
            'ai_automation_risk': 50.0,
            'job_growth_projection': 0.0,
            'required_skills_adaptation': 'Medium',
            'ai_impact_level': 'Moderate',
            'avg_salary_2024': 60000.0,
            'projected_salary_2030': 65000.0,
            'data_source': 'default',
            'confidence': 'low'
        }
    
    def calculate_resilience_score(self, job_data: Dict[str, Any], 
                                   user_experience: str,
                                   user_skills: list) -> Dict[str, Any]:
        """
        Calculate AI resilience score based on job data and user profile
        
        Args:
            job_data: Job market data from get_job_data()
            user_experience: User's experience level
            user_skills: List of user's skills
            
        Returns:
            Dictionary with score and analysis
        """
        # Base score starts at 50
        score = 50.0
        
        # Factor 1: AI Automation Risk (inverse relationship)
        # Lower risk = higher score
        automation_risk = job_data['ai_automation_risk']
        score += (50 - automation_risk) * 0.6  # Weight: 0.6
        
        # Factor 2: Job Growth Projection
        growth = job_data['job_growth_projection']
        score += growth * 0.4  # Weight: 0.4
        
        # Factor 3: Experience bonus
        experience_bonuses = {
            'recent-grad': -10,
            'early-career': 0,
            'mid-career': 10,
            'veteran': 15
        }
        score += experience_bonuses.get(user_experience, 0)
        
        # Factor 4: Skills assessment
        valuable_skills = ['ml', 'programming', 'automation', 'data-analysis', 'blockchain']
        skill_matches = sum(1 for skill in user_skills if skill in valuable_skills)
        score += skill_matches * 5  # 5 points per valuable skill
        
        # Clamp score to 0-100
        score = max(0, min(100, score))
        
        # Determine risk level
        if score >= 70:
            risk_level = 'low'
            outlook = 'positive'
        elif score >= 40:
            risk_level = 'medium'
            outlook = 'neutral'
        else:
            risk_level = 'high'
            outlook = 'concerning'
        
        # Calculate salary change
        salary_change = job_data['projected_salary_2030'] - job_data['avg_salary_2024']
        salary_change_pct = (salary_change / job_data['avg_salary_2024']) * 100 if job_data['avg_salary_2024'] > 0 else 0
        
        return {
            'score': round(score, 1),
            'risk_level': risk_level,
            'outlook': outlook,
            'factors': {
                'automation_risk': round(automation_risk, 1),
                'growth_projection': round(growth, 1),
                'skills_adaptation': job_data['required_skills_adaptation'],
                'salary_trend': round(salary_change_pct, 1)
            },
            'salary_analysis': {
                'current': job_data['avg_salary_2024'],
                'projected': job_data['projected_salary_2030'],
                'change_percent': round(salary_change_pct, 1)
            }
        }
    
    def get_dataset_summary(self) -> Dict[str, Any]:
        """Get summary statistics of the dataset"""
        if self.df is None:
            self.load_dataset()
        
        return {
            'total_jobs': len(self.df),
            'industries': self.df['Industry'].nunique() if 'Industry' in self.df.columns else 0,
            'avg_automation_risk': float(self.df['AI_Automation_Risk'].mean()) if 'AI_Automation_Risk' in self.df.columns else 0,
            'highest_risk_jobs': self.df.nlargest(5, 'AI_Automation_Risk')[['Job_Title', 'AI_Automation_Risk']].to_dict('records') if 'AI_Automation_Risk' in self.df.columns else [],
            'lowest_risk_jobs': self.df.nsmallest(5, 'AI_Automation_Risk')[['Job_Title', 'AI_Automation_Risk']].to_dict('records') if 'AI_Automation_Risk' in self.df.columns else []
        }


# Singleton instance
_loader_instance = None

def get_loader() -> JobMarketDataLoader:
    """Get or create the singleton data loader instance"""
    global _loader_instance
    if _loader_instance is None:
        _loader_instance = JobMarketDataLoader()
        _loader_instance.load_dataset()
    return _loader_instance


if __name__ == "__main__":
    # Test the loader
    loader = get_loader()
    
    print("\n=== Dataset Summary ===")
    summary = loader.get_dataset_summary()
    print(json.dumps(summary, indent=2))
    
    print("\n=== Test: Software Developer ===")
    job_data = loader.get_job_data("Software Developer", "Technology")
    print(json.dumps(job_data, indent=2))
    
    print("\n=== Test: Resilience Score ===")
    score_data = loader.calculate_resilience_score(
        job_data,
        user_experience='mid-career',
        user_skills=['programming', 'ml']
    )
    print(json.dumps(score_data, indent=2))

