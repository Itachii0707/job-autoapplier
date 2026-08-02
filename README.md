# 🤖 AI Job Auto-Applier Platform

An autonomous, full-stack AI job application tool powered by **FastAPI**, **Playwright**, **Instructor (LLM Structured Outputs)**, and **React 19 + Tailwind CSS**. Automatically searches job boards (LinkedIn "Easy Apply"), extracts dynamic application form fields, and intelligently populates inputs based on your resume and profile.

---

## ⚡ Tech Stack

- **Backend API**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (SQLite)
- **Automation Engine**: Playwright Async Python with humanized anti-bot evasion & persistent context
- **AI Engine**: Instructor + Google Gemini / OpenAI / Anthropic SDKs (Dynamic JSON Form Extraction)
- **Frontend Dashboard**: React 19, Vite 6, Tailwind CSS v4, Lucide React
- **Resume Processor**: PyPDF & PDFPlumber text extractor

---

## 📁 Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI server entrypoint
│   ├── config.py            # Environment & app configuration
│   ├── database.py          # SQLAlchemy 2.0 database engine
│   ├── models.py            # SQLite database schemas
│   ├── schemas.py           # Pydantic v2 request/response models
│   ├── scraper.py           # Playwright automation engine
│   ├── ai_agent.py          # LLM dynamic form parser
│   ├── resume_parser.py     # Resume text extractor
│   └── routes/              # API route controllers
├── frontend/                # Vite React 19 Dashboard
├── uploads/                 # Stored resume files
├── user_data/               # Persistent Playwright browser session
├── .env.example             # Configuration settings template
├── requirements.txt         # Python dependencies
└── package.json             # Frontend dependencies
```

---

## 🚀 Quick Start (Setup Instructions)

### 1. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browser binaries
playwright install chromium
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend Server (runs on http://localhost:8000)
uvicorn backend.main:app --reload

# Terminal 2: Frontend Dashboard (runs on http://localhost:3000)
cd frontend
npm run dev
```
