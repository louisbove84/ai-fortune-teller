"""
Python API server for AI Fortune Teller
Provides endpoints for Kaggle data and LLM generation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from typing import Dict, Any
from pathlib import Path

from kaggle_data_loader import get_loader
from llm_generator import FortuneLLMGenerator

# Load environment variables from .env.local if it exists
from dotenv import load_dotenv

# Try to load from .env.local (Next.js convention)
env_local = Path(__file__).parent.parent.parent / '.env.local'
if env_local.exists():
    print(f"📄 Loading environment from {env_local}")
    load_dotenv(env_local)
else:
    # Fallback to .env
    env_file = Path(__file__).parent.parent.parent / '.env'
    if env_file.exists():
        print(f"📄 Loading environment from {env_file}")
        load_dotenv(env_file)

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Initialize services
data_loader = get_loader()
llm_generator = None  # Initialize lazily when needed

def get_llm_generator():
    """Lazy initialization of LLM generator"""
    global llm_generator
    if llm_generator is None:
        try:
            llm_generator = FortuneLLMGenerator()
            print(f"✅ LLM generator initialized: {llm_generator.provider}")
        except ValueError as e:
            print(f"⚠️  Warning: LLM generator not available: {e}")
            print("    Premium features will be unavailable.")
            llm_generator = None
    return llm_generator


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'services': {
            'kaggle_data': data_loader is not None,
            'llm': get_llm_generator() is not None
        }
    })


@app.route('/api/dataset/summary', methods=['GET'])
def get_dataset_summary():
    """Get summary statistics of the Kaggle dataset"""
    try:
        summary = data_loader.get_dataset_summary()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/job-suggestions', methods=['POST'])
def get_job_suggestions():
    """
    Get job title suggestions based on user input
    
    Request body:
    {
        "query": "software"
    }
    
    Returns:
    {
        "suggestions": ["Software Developer", "Software Engineer", ...]
    }
    """
    try:
        data = request.get_json()
        query = data.get('query', '').lower().strip()
        
        if len(query) < 2:
            return jsonify({'suggestions': []})
        
        # Get unique job titles from dataset
        df = data_loader.df
        if df is None:
            data_loader.load_dataset()
            df = data_loader.df
        
        # Filter job titles that contain the query
        job_col = 'Job Title' if 'Job Title' in df.columns else 'Job_Title'
        matching_jobs = df[df[job_col].str.lower().str.contains(query, na=False)]
        
        # Get unique job titles, sorted by frequency
        suggestions = matching_jobs[job_col].value_counts().head(15).index.tolist()
        
        return jsonify({
            'suggestions': suggestions,
            'total_matches': len(matching_jobs)
        })
        
    except Exception as e:
        print(f"Error getting job suggestions: {e}")
        return jsonify({'error': 'Failed to get job suggestions'}), 500


@app.route('/api/fortune/free', methods=['POST'])
def get_free_fortune():
    """
    Generate free fortune based on Kaggle data with enhanced salary analysis
    
    Request body:
    {
        "job_title": "Software Developer",
        "current_salary": "75k-100k",
        "location": "USA",
        "experience": "6-10",
        "education": "bachelor",
        "ai_skills": "intermediate"
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['job_title', 'current_salary', 'location', 'experience', 'education', 'ai_skills']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get job data from Kaggle dataset
        job_data = data_loader.get_job_data(data['job_title'], data.get('location'))
        
        # Calculate salary comparison
        salary_comparison = _calculate_salary_comparison(data['current_salary'], job_data)
        
        # Calculate enhanced resilience score
        score_data = data_loader.calculate_resilience_score(
            job_data,
            data['experience'],
            [data['ai_skills']]  # Convert to list format
        )
        
        # Add salary analysis to score data
        score_data['salary_analysis']['user_comparison'] = salary_comparison
        
        # Generate narrative (basic template for free tier)
        narrative = _generate_free_narrative(data, job_data, score_data)
        
        return jsonify({
            'score': score_data['score'],
            'narrative': narrative,
            'riskLevel': score_data['risk_level'],
            'outlook': score_data['outlook'],
            'factors': score_data['factors'],
            'salary_analysis': score_data['salary_analysis'],
            'job_data': {
                'automation_risk': job_data['ai_automation_risk'],
                'growth_projection': job_data['job_growth_projection'],
                'skills_needed': job_data['required_skills_adaptation'],
                'industry': job_data.get('industry', 'Unknown'),
                'location': job_data.get('location', 'Unknown')
            },
            'data_source': job_data['data_source'],
            'tier': 'free'
        })
        
    except Exception as e:
        print(f"Error generating free fortune: {e}")
        return jsonify({'error': 'Failed to generate fortune'}), 500


@app.route('/api/fortune/premium', methods=['POST'])
def get_premium_fortune():
    """
    Generate premium fortune with LLM-powered insights
    
    Request body:
    {
        "role": "developer",
        "experience": "mid-career",
        "skills": ["programming", "ml"],
        "industry": "tech",
        "age": "26-35",
        "address": "0x..."
    }
    """
    try:
        data = request.get_json()
        
        # Check if LLM is available
        llm = get_llm_generator()
        if llm is None:
            return jsonify({
                'error': 'Premium features unavailable. GROK_API_KEY or OPENAI_API_KEY required.'
            }), 503
        
        # Validate input
        required_fields = ['role', 'experience', 'skills', 'industry', 'age', 'address']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get job data from Kaggle dataset
        job_data = data_loader.get_job_data(data['role'], data['industry'])
        
        # Calculate resilience score
        score_data = data_loader.calculate_resilience_score(
            job_data,
            data['experience'],
            data['skills']
        )
        
        # Generate premium fortune with LLM
        user_profile = {
            'role': data['role'],
            'experience': data['experience'],
            'skills': data['skills'],
            'industry': data['industry'],
            'age': data['age']
        }
        
        premium_fortune = llm.generate_premium_fortune(
            user_profile,
            job_data,
            score_data
        )
        
        # Generate NFT image prompt
        nft_prompt = llm.generate_nft_image_prompt(user_profile, {
            **score_data,
            **premium_fortune
        })
        
        return jsonify({
            'score': score_data['score'],
            'narrative': premium_fortune['narrative'],
            'riskLevel': score_data['risk_level'],
            'outlook': score_data['outlook'],
            'strategies': premium_fortune['strategies'],
            'keyInsights': premium_fortune['key_insights'],
            'timeline': premium_fortune['timeline'],
            'resources': premium_fortune['resources'],
            'warnings': premium_fortune['warnings'],
            'opportunities': premium_fortune['opportunities'],
            'nftMetadata': {
                'name': f"Prophecy #{data['address'][-6:]}",
                'description': premium_fortune['nft_description'],
                'imagePrompt': nft_prompt,
                'attributes': [
                    {'trait_type': 'Occupation', 'value': data['role']},
                    {'trait_type': 'AI Resilience Score', 'value': score_data['score']},
                    {'trait_type': 'Risk Level', 'value': score_data['risk_level']},
                    {'trait_type': 'Automation Risk', 'value': f"{job_data['ai_automation_risk']}%"},
                    {'trait_type': 'Growth Projection', 'value': f"{job_data['job_growth_projection']}%"},
                    {'trait_type': 'Generated By', 'value': premium_fortune['generated_by']}
                ]
            },
            'fateMap': _generate_fate_map(data, score_data, premium_fortune),
            'factors': score_data['factors'],
            'salary_analysis': score_data['salary_analysis'],
            'tier': 'premium'
        })
        
    except Exception as e:
        print(f"Error generating premium fortune: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to generate premium fortune'}), 500


def _calculate_salary_comparison(user_salary_range: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate how user's salary compares to market data"""
    
    # Map salary ranges to numeric values
    salary_ranges = {
        'under-30k': {'min': 0, 'max': 30000, 'mid': 15000},
        '30k-50k': {'min': 30000, 'max': 50000, 'mid': 40000},
        '50k-75k': {'min': 50000, 'max': 75000, 'mid': 62500},
        '75k-100k': {'min': 75000, 'max': 100000, 'mid': 87500},
        '100k-150k': {'min': 100000, 'max': 150000, 'mid': 125000},
        '150k-200k': {'min': 150000, 'max': 200000, 'mid': 175000},
        'over-200k': {'min': 200000, 'max': 1000000, 'mid': 300000},
    }
    
    user_range = salary_ranges.get(user_salary_range, {'min': 0, 'max': 0, 'mid': 0})
    market_median = job_data.get('avg_salary_2024', 60000)
    
    # Calculate percentile (rough estimate)
    if user_range['mid'] < market_median * 0.5:
        percentile = 10
    elif user_range['mid'] < market_median * 0.75:
        percentile = 25
    elif user_range['mid'] < market_median * 1.25:
        percentile = 50
    elif user_range['mid'] < market_median * 1.5:
        percentile = 75
    else:
        percentile = 90
    
    return {
        'user_salary_range': user_salary_range,
        'market_median': market_median,
        'percentile': percentile,
        'user_midpoint': user_range['mid'],
        'comparison': 'above' if user_range['mid'] > market_median else 'below' if user_range['mid'] < market_median * 0.8 else 'at_market'
    }


def _generate_free_narrative(user_data: Dict[str, Any],
                             job_data: Dict[str, Any],
                             score_data: Dict[str, Any]) -> str:
    """Generate enhanced narrative for free tier with salary insights"""
    
    job_title = user_data['job_title']
    score = score_data['score']
    risk = job_data['ai_automation_risk']
    growth = job_data['job_growth_projection']
    salary_comparison = score_data['salary_analysis']['user_comparison']
    
    intro = f"🔮 The crystal ball reveals your path, {job_title}..."
    
    if score >= 70:
        assessment = f"Fortune smiles upon you! Your resilience score of {score}/100 positions you well for the AI age."
    elif score >= 40:
        assessment = f"Your journey requires vigilance. With a score of {score}/100, adaptation is key to your success."
    else:
        assessment = f"The stars warn of challenges ahead. At {score}/100, immediate action is needed to secure your future."
    
    # Enhanced salary analysis
    market_median = salary_comparison['market_median']
    percentile = salary_comparison['percentile']
    comparison = salary_comparison['comparison']
    
    if comparison == 'above':
        salary_msg = f"\n\n💰 Your salary is above market median (${market_median:,.0f}), placing you in the top {100-percentile}% of earners in your field."
    elif comparison == 'below':
        salary_msg = f"\n\n💰 Your salary is below market median (${market_median:,.0f}), indicating room for growth and negotiation opportunities."
    else:
        salary_msg = f"\n\n💰 Your salary aligns with market median (${market_median:,.0f}), showing you're competitively positioned."
    
    risk_msg = f"\n\nYour field faces {risk:.0f}% automation risk by 2030"
    if risk > 60:
        risk_msg += ", requiring significant transformation."
    elif risk > 30:
        risk_msg += ", but opportunity exists for those who adapt."
    else:
        risk_msg += " - your skills remain valuable in the AI age."
    
    growth_msg = f" Job growth projections show {abs(growth):.0f}% {'growth' if growth > 0 else 'decline'} through 2030."
    
    salary_change = score_data['salary_analysis']['change_percent']
    if salary_change > 10:
        salary_trend = f" Your earning potential looks promising with {salary_change:.0f}% projected growth."
    elif salary_change < -5:
        salary_trend = f" Salary pressures exist with {abs(salary_change):.0f}% projected decline."
    else:
        salary_trend = " Earnings are expected to remain stable."
    
    conclusion = "\n\nRemember: Those who embrace change and continuously adapt shall thrive. Unlock premium insights for your personalized roadmap to AI resilience."
    
    return intro + "\n\n" + assessment + salary_msg + risk_msg + growth_msg + salary_trend + conclusion


def _generate_fate_map(user_data: Dict[str, Any],
                      score_data: Dict[str, Any],
                      fortune_data: Dict[str, Any]) -> list:
    """Generate fate map visualization data"""
    
    score = score_data['score']
    
    # Create decision tree based on score
    if score >= 70:
        # High resilience path
        return [
            {'id': 'current', 'label': 'Now', 'x': 10, 'y': 50, 'type': 'current', 'connections': ['decision1']},
            {'id': 'decision1', 'label': 'Leverage AI', 'x': 35, 'y': 30, 'type': 'decision', 'connections': ['outcome1']},
            {'id': 'outcome1', 'label': 'Industry Leader', 'x': 60, 'y': 20, 'type': 'outcome', 'connections': ['decision2']},
            {'id': 'decision2', 'label': 'Scale Impact', 'x': 75, 'y': 25, 'type': 'decision', 'connections': ['final1']},
            {'id': 'final1', 'label': 'Thrive & Innovate', 'x': 95, 'y': 20, 'type': 'outcome', 'connections': []},
        ]
    elif score >= 40:
        # Medium resilience path
        return [
            {'id': 'current', 'label': 'Now', 'x': 10, 'y': 50, 'type': 'current', 'connections': ['decision1']},
            {'id': 'decision1', 'label': 'Upskill?', 'x': 30, 'y': 35, 'type': 'decision', 'connections': ['outcome1', 'outcome2']},
            {'id': 'outcome1', 'label': 'Adapt', 'x': 50, 'y': 25, 'type': 'outcome', 'connections': ['decision2']},
            {'id': 'outcome2', 'label': 'Status Quo', 'x': 50, 'y': 65, 'type': 'outcome', 'connections': ['final2']},
            {'id': 'decision2', 'label': 'Partner with AI', 'x': 70, 'y': 30, 'type': 'decision', 'connections': ['final1']},
            {'id': 'final1', 'label': 'Secure Future', 'x': 90, 'y': 25, 'type': 'outcome', 'connections': []},
            {'id': 'final2', 'label': 'Uncertainty', 'x': 90, 'y': 70, 'type': 'outcome', 'connections': []},
        ]
    else:
        # Low resilience path - urgent action needed
        return [
            {'id': 'current', 'label': 'Now', 'x': 10, 'y': 50, 'type': 'current', 'connections': ['decision1']},
            {'id': 'decision1', 'label': 'Take Action?', 'x': 25, 'y': 40, 'type': 'decision', 'connections': ['outcome1', 'outcome3']},
            {'id': 'outcome1', 'label': 'Pivot', 'x': 45, 'y': 25, 'type': 'outcome', 'connections': ['decision2']},
            {'id': 'outcome3', 'label': 'Ignore', 'x': 45, 'y': 75, 'type': 'outcome', 'connections': ['final3']},
            {'id': 'decision2', 'label': 'Commit to Change', 'x': 65, 'y': 30, 'type': 'decision', 'connections': ['outcome2', 'final2']},
            {'id': 'outcome2', 'label': 'Rebuild', 'x': 85, 'y': 20, 'type': 'outcome', 'connections': []},
            {'id': 'final2', 'label': 'Struggle', 'x': 85, 'y': 50, 'type': 'outcome', 'connections': []},
            {'id': 'final3', 'label': 'High Risk', 'x': 85, 'y': 80, 'type': 'outcome', 'connections': []},
        ]


if __name__ == '__main__':
    # Get port from environment or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    print(f"""
    🔮 AI Fortune Teller Python API Server
    
    Endpoints:
    - GET  /health                  - Health check
    - GET  /api/dataset/summary     - Dataset statistics
    - POST /api/fortune/free        - Free fortune (Kaggle data)
    - POST /api/fortune/premium     - Premium fortune (LLM-powered)
    
    Starting on http://localhost:{port}
    """)
    
    app.run(host='0.0.0.0', port=port, debug=True)

