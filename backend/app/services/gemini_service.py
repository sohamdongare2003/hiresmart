import json
import re
from google import genai
from google.genai import types
from app.core.config import settings

_PARSE_PROMPT = """
You are an expert resume parser for an IT recruitment platform.
Analyze the resume text below and extract structured information.

Return ONLY a valid JSON object — no markdown, no code fences.

JSON structure:
{{
  "full_name": "<string | null>",
  "email": "<string | null>",
  "phone": "<string | null>",
  "experience_years": "<string e.g. '3 years', 'fresher' | null>",
  "skills": ["<skill1>", "<skill2>", ...],
  "education": [{{"degree": "", "institution": "", "year": ""}}],
  "summary": "<2-3 line professional summary>"
}}

Rules:
- skills: technical skills only, no soft skills
- Return null for missing fields
- summary: write as a recruiter would

Resume text:
---
{resume_text}
---
"""


def _parse_gemini_response(raw: str) -> dict:
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Invalid JSON from Gemini: {raw[:200]}")


class GeminiService:

    @staticmethod
    def parse_resume(resume_text: str) -> dict:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY not configured.")
        if not resume_text or len(resume_text.strip()) < 50:
            raise ValueError("Resume text too short.")
        prompt = _PARSE_PROMPT.format(resume_text=resume_text[:12000])
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.1, max_output_tokens=1024),
            )
            raw_text = response.text
        except Exception as e:
            raise RuntimeError(f"Gemini API failed: {e}")
        data = _parse_gemini_response(raw_text)
        return {
            "full_name":        data.get("full_name"),
            "email":            data.get("email"),
            "phone":            data.get("phone"),
            "experience_years": data.get("experience_years"),
            "skills":           [s.strip() for s in (data.get("skills") or []) if s.strip()],
            "education":        data.get("education") or [],
            "summary":          data.get("summary"),
        }