import os
import pypdf
from typing import Dict, List, Tuple

COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "FastAPI", "Express",
    "SQL", "PostgreSQL", "MongoDB", "SQLite", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "Git", "REST API", "GraphQL", "CI/CD", "Tailwind CSS", "HTML5", "CSS3", "Linux",
    "Playwright", "Selenium", "Scrapy", "Machine Learning", "PyTorch", "TensorFlow", "Pandas"
]

def extract_text_from_pdf(filepath: str) -> str:
    """Extract plain text from a PDF file using pypdf."""
    text = ""
    try:
        reader = pypdf.PdfReader(filepath)
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    except Exception as e:
        print(f"Error reading PDF {filepath}: {e}")
    return text.strip()

def analyze_resume_keywords(text: str) -> Tuple[List[str], List[str]]:
    """Compare resume text against common high-demand software engineering keywords."""
    found_skills = []
    missing_skills = []
    text_lower = text.lower()

    for skill in COMMON_SKILLS:
        if skill.lower() in text_lower:
            found_skills.append(skill)
        else:
            missing_skills.append(skill)

    # Provide a curated top subset for UI presentation
    return found_skills[:10], missing_skills[:6]
