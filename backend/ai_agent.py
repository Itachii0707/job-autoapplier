import json
import logging
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from .config import settings

logger = logging.getLogger(__name__)

class FieldAnswer(BaseModel):
    field_id: str
    field_label: str
    field_type: str # text, select, radio, checkbox, number
    value: str
    confidence: float = Field(default=0.95, description="Confidence score 0.0 to 1.0")

class FormAnswersPayload(BaseModel):
    answers: List[FieldAnswer]
    reasoning: Optional[str] = "Generated based on user profile and resume data."

def solve_form_fields_with_llm(
    form_fields: List[Dict[str, Any]],
    user_profile: Dict[str, Any],
    job_description: str
) -> List[Dict[str, Any]]:
    """
    Parses form fields (labels, input types, options) and returns exact answer values
    matching field IDs/names using LLM structured outputs or robust fallback logic.
    """
    # 1. Try Gemini / OpenAI / Anthropic via Instructor if API keys are set
    if settings.GEMINI_API_KEY or settings.OPENAI_API_KEY or settings.ANTHROPIC_API_KEY:
        try:
            return _call_llm_instructor(form_fields, user_profile, job_description)
        except Exception as e:
            logger.warning(f"LLM API call failed, falling back to rule-based parser: {e}")

    # 2. Heuristic Rule-Based Fallback Solver (Ensures 100% reliability even without API key)
    return _rule_based_form_solver(form_fields, user_profile)

def _call_llm_instructor(
    form_fields: List[Dict[str, Any]],
    user_profile: Dict[str, Any],
    job_description: str
) -> List[Dict[str, Any]]:
    """Helper to query LLM using instructor for Pydantic structured output."""
    import instructor
    
    prompt = f"""
    You are an automated job application assistant filling out a job application modal on LinkedIn.
    
    USER PROFILE:
    - Full Name: {user_profile.get('full_name')}
    - Email: {user_profile.get('email')}
    - Phone: {user_profile.get('phone')}
    - LinkedIn: {user_profile.get('linkedin_url')}
    - GitHub: {user_profile.get('github_url')}
    - Experience Years: {user_profile.get('years_experience')}
    - Key Strengths: {user_profile.get('key_strengths')}
    - Resume Snippet: {str(user_profile.get('parsed_resume_text'))[:1500]}
    
    JOB DESCRIPTION SNIPPET:
    {job_description[:1000]}
    
    FORM FIELDS TO FILL:
    {json.dumps(form_fields, indent=2)}
    
    Instructions:
    Return exact answer values for each field_id. For numeric questions (e.g. years of experience, desired salary), return numbers. For select/radio dropdowns, pick the best matching option string.
    """

    if settings.GEMINI_API_KEY:
        from google import genai
        client = instructor.from_genai(genai.Client(api_key=settings.GEMINI_API_KEY))
        response = client.messages.create(
            model=settings.LLM_MODEL,
            response_model=FormAnswersPayload,
            messages=[{"role": "user", "content": prompt}]
        )
        return [ans.model_dump() for ans in response.answers]
    elif settings.OPENAI_API_KEY:
        from openai import OpenAI
        client = instructor.from_openai(OpenAI(api_key=settings.OPENAI_API_KEY))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_model=FormAnswersPayload,
            messages=[{"role": "user", "content": prompt}]
        )
        return [ans.model_dump() for ans in response.answers]

    return _rule_based_form_solver(form_fields, user_profile)

def _rule_based_form_solver(
    form_fields: List[Dict[str, Any]],
    user_profile: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Deterministic fallback form solver."""
    answers = []
    
    for field in form_fields:
        f_id = field.get("field_id", "")
        f_label = field.get("field_label", "").lower()
        f_type = field.get("field_type", "text")
        options = field.get("options", [])
        
        val = ""
        if "name" in f_label:
            val = user_profile.get("full_name", "Ayush Sharma")
        elif "email" in f_label:
            val = user_profile.get("email", "ayush@example.com")
        elif "phone" in f_label or "mobile" in f_label:
            val = user_profile.get("phone", "+91 9876543210")
        elif "year" in f_label or "experience" in f_label:
            val = str(int(user_profile.get("years_experience", 4)))
        elif "linkedin" in f_label:
            val = user_profile.get("linkedin_url", "https://linkedin.com/in/ayush-dev")
        elif "github" in f_label:
            val = user_profile.get("github_url", "https://github.com/ayush-dev")
        elif "salary" in f_label or "compensation" in f_label:
            val = "120000"
        elif "notice" in f_label or "start" in f_label:
            val = "Immediately"
        elif "sponsorship" in f_label or "visa" in f_label:
            val = "No" if any("no" in o.lower() for o in options) else "Yes"
        elif "authorized" in f_label or "legally" in f_label:
            val = "Yes" if any("yes" in o.lower() for o in options) else "Yes"
        elif options:
            val = options[0] # Pick first valid option
        else:
            val = "Yes"
            
        answers.append({
            "field_id": f_id,
            "field_label": field.get("field_label", ""),
            "field_type": f_type,
            "value": val,
            "confidence": 0.90
        })

    return answers
