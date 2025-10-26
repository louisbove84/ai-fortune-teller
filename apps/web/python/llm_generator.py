"""
LLM-powered fortune generator for premium tier
Uses OpenAI API to generate personalized career advice
"""

import os
from typing import Dict, Any, List, Optional
from openai import OpenAI
import json
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
env_local = Path(__file__).parent.parent.parent / '.env.local'
if env_local.exists():
    load_dotenv(env_local)
else:
    load_dotenv(Path(__file__).parent.parent.parent / '.env')

class FortuneLLMGenerator:
    """Generate personalized fortunes using LLM"""
    
    def __init__(self, api_key: Optional[str] = None, provider: Optional[str] = None):
        """
        Initialize LLM generator
        
        Args:
            api_key: API key (defaults to GROK_API_KEY or OPENAI_API_KEY env var)
            provider: LLM provider - "grok" or "openai" (auto-detects from env)
        """
        # Auto-detect provider based on available env vars
        if provider is None:
            if os.getenv('GROK_API_KEY'):
                provider = 'grok'
                self.api_key = os.getenv('GROK_API_KEY')
            elif os.getenv('OPENAI_API_KEY'):
                provider = 'openai'
                self.api_key = os.getenv('OPENAI_API_KEY')
            else:
                raise ValueError("LLM API key required. Set GROK_API_KEY or OPENAI_API_KEY environment variable.")
        else:
            self.api_key = api_key
        
        if not self.api_key:
            raise ValueError(f"API key required for {provider}")
        
        self.provider = provider
        
        # Configure client based on provider
        if provider == 'grok':
            self.client = OpenAI(
                api_key=self.api_key,
                base_url="https://api.x.ai/v1"
            )
            self.model = "grok-3"  # Grok's latest model (updated from grok-beta)
            print("🤖 Using Grok (xAI) for LLM generation")
        else:  # openai
            self.client = OpenAI(api_key=self.api_key)
            self.model = "gpt-4o-mini"  # Cost-effective model
            print("🤖 Using OpenAI GPT-4o-mini for LLM generation")
    
    def generate_premium_fortune(self, 
                                 user_profile: Dict[str, Any],
                                 job_data: Dict[str, Any],
                                 resilience_score: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive premium fortune with personalized advice
        
        Args:
            user_profile: User's quiz answers
            job_data: Kaggle dataset job information
            resilience_score: Calculated resilience metrics
            
        Returns:
            Dictionary with detailed fortune, strategies, and insights
        """
        
        prompt = self._build_fortune_prompt(user_profile, job_data, resilience_score)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a mystical AI fortune teller specializing in career futures. You provide insightful, actionable advice in an engaging, slightly mystical tone while being grounded in real data and trends. Format responses as JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.8,  # Creative but not random
                max_tokens=2000
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Ensure required fields exist
            return {
                'narrative': result.get('narrative', 'The crystal ball reveals your path...'),
                'strategies': result.get('strategies', []),
                'key_insights': result.get('key_insights', []),
                'timeline': result.get('timeline', {}),
                'resources': result.get('resources', []),
                'warnings': result.get('warnings', []),
                'opportunities': result.get('opportunities', []),
                'nft_description': result.get('nft_description', ''),
                'generated_by': f'{self.provider}-{self.model}'
            }
            
        except Exception as e:
            print(f"Error generating fortune: {e}")
            # Fallback to basic fortune
            return self._generate_fallback_fortune(user_profile, job_data, resilience_score)
    
    def _build_fortune_prompt(self, 
                             user_profile: Dict[str, Any],
                             job_data: Dict[str, Any],
                             resilience_score: Dict[str, Any]) -> str:
        """Build the prompt for the LLM"""
        
        return f"""As a mystical AI fortune teller, analyze this person's career future against AI disruption:

**User Profile:**
- Occupation: {user_profile.get('role', 'Unknown')}
- Experience: {user_profile.get('experience', 'Unknown')}
- Skills: {', '.join(user_profile.get('skills', []))}
- Industry: {user_profile.get('industry', 'Unknown')}
- Age Range: {user_profile.get('age', 'Unknown')}

**Job Market Data (2024-2030):**
- AI Automation Risk: {job_data.get('ai_automation_risk', 'N/A')}%
- Job Growth Projection: {job_data.get('job_growth_projection', 'N/A')}%
- Required Skills Adaptation: {job_data.get('required_skills_adaptation', 'Unknown')}
- Current Avg Salary: ${job_data.get('avg_salary_2024', 'N/A'):,.0f}
- Projected 2030 Salary: ${job_data.get('projected_salary_2030', 'N/A'):,.0f}

**Calculated Resilience:**
- Score: {resilience_score.get('score', 'N/A')}/100
- Risk Level: {resilience_score.get('risk_level', 'Unknown')}
- Outlook: {resilience_score.get('outlook', 'Unknown')}

Generate a comprehensive fortune in JSON format with:

1. **narrative** (string): A 250-word mystical prophecy that:
   - Opens with a cosmic/mystical hook
   - Explains their current position in the AI age
   - Highlights both opportunities and challenges
   - Ends with an empowering call to action
   - Maintains a balance of mysticism and practical insight

2. **strategies** (array of 3-4 objects): Actionable career strategies, each with:
   - title: Short, compelling strategy name
   - description: Detailed 2-3 sentence explanation
   - timeline: Realistic timeframe (e.g., "3-6 months", "1-2 years")
   - difficulty: "Easy", "Moderate", or "Challenging"
   - impact: "High", "Medium", or "Low"

3. **key_insights** (array of 3-5 strings): Critical insights about their career path

4. **timeline** (object): Key milestones with:
   - next_3_months: Immediate actions
   - next_year: Medium-term goals
   - next_3_years: Long-term vision

5. **resources** (array of 5-7 strings): Specific resources (courses, certifications, communities)

6. **warnings** (array of 2-3 strings): Things to watch out for or avoid

7. **opportunities** (array of 3-4 strings): Emerging opportunities in their field

8. **nft_description** (string): Creative 1-sentence description for their NFT artwork (e.g., "A battle-hardened accountant as a cyberpunk phoenix rising from spreadsheets")

Make it personal, insightful, and actionable. Use their specific job title and industry in recommendations."""

    def _generate_fallback_fortune(self,
                                   user_profile: Dict[str, Any],
                                   job_data: Dict[str, Any],
                                   resilience_score: Dict[str, Any]) -> Dict[str, Any]:
        """Generate basic fortune if LLM fails"""
        
        role = user_profile.get('role', 'professional')
        score = resilience_score.get('score', 50)
        
        return {
            'narrative': f"""The cosmic energies reveal your path, {role}. Your resilience score of {score}/100 shows {"great promise" if score >= 70 else "a journey ahead" if score >= 40 else "challenges to overcome"}. The age of AI brings both disruption and opportunity. Those who adapt, learning to partner with artificial intelligence rather than compete against it, shall thrive. Your path requires vigilance, continuous learning, and strategic positioning.""",
            
            'strategies': [
                {
                    'title': 'Embrace AI as Your Tool',
                    'description': 'Learn to use AI tools in your daily work. Position yourself as the expert who knows how to leverage AI, not the one replaced by it.',
                    'timeline': '3-6 months',
                    'difficulty': 'Moderate',
                    'impact': 'High'
                },
                {
                    'title': 'Build Uniquely Human Skills',
                    'description': 'Focus on skills AI cannot replicate: emotional intelligence, creative problem-solving, complex negotiation, and relationship building.',
                    'timeline': 'Ongoing',
                    'difficulty': 'Moderate',
                    'impact': 'High'
                }
            ],
            
            'key_insights': [
                f'Your field faces {job_data.get("ai_automation_risk", 50)}% automation risk by 2030',
                'Continuous learning is no longer optional',
                'Your experience is an asset if paired with new skills'
            ],
            
            'timeline': {
                'next_3_months': 'Audit your skills, identify gaps, start one course',
                'next_year': 'Achieve one new certification, apply new skills at work',
                'next_3_years': 'Position yourself as an AI-augmented expert in your field'
            },
            
            'resources': [
                'Coursera AI for Everyone',
                'LinkedIn Learning',
                'Industry-specific AI workshops'
            ],
            
            'warnings': [
                'Don\'t ignore AI - it won\'t ignore you',
                'Avoid complacency in rapidly changing markets'
            ],
            
            'opportunities': [
                'AI-augmented roles in your industry',
                'Consulting as an AI integration expert',
                'Training others in AI adoption'
            ],
            
            'nft_description': f'A {role} transformed into a cyberpunk mystic wielding AI powers',
            
            'generated_by': 'fallback'
        }
    
    def generate_nft_image_prompt(self, user_profile: Dict[str, Any], 
                                  fortune_data: Dict[str, Any]) -> str:
        """
        Generate a DALL-E prompt for the NFT artwork
        
        Args:
            user_profile: User's profile data
            fortune_data: Generated fortune data
            
        Returns:
            Image generation prompt
        """
        
        role = user_profile.get('role', 'professional')
        score = fortune_data.get('score', 50)
        
        # Use LLM-generated description if available
        if 'nft_description' in fortune_data:
            base_description = fortune_data['nft_description']
        else:
            base_description = f"A {role} in a futuristic AI-augmented world"
        
        style_prompt = "digital art, cyberpunk aesthetic, mystical elements, vibrant colors, professional illustration, fortune teller theme"
        
        return f"{base_description}, {style_prompt}, high quality, 1024x1024"


# Example usage
if __name__ == "__main__":
    from typing import Optional
    
    # Test the generator (requires OPENAI_API_KEY)
    try:
        # Will auto-detect Grok or OpenAI from environment
        generator = FortuneLLMGenerator()
        print(f"Testing with {generator.provider} - {generator.model}")
        
        test_profile = {
            'role': 'developer',
            'experience': 'mid-career',
            'skills': ['programming', 'ml'],
            'industry': 'tech',
            'age': '26-35'
        }
        
        test_job_data = {
            'ai_automation_risk': 15,
            'job_growth_projection': 25,
            'required_skills_adaptation': 'High',
            'avg_salary_2024': 95000,
            'projected_salary_2030': 120000
        }
        
        test_score = {
            'score': 78,
            'risk_level': 'low',
            'outlook': 'positive'
        }
        
        print("Generating premium fortune...")
        result = generator.generate_premium_fortune(test_profile, test_job_data, test_score)
        print(json.dumps(result, indent=2))
        
    except ValueError as e:
        print(f"Error: {e}")
        print("Set GROK_API_KEY or OPENAI_API_KEY environment variable to test LLM generation")

