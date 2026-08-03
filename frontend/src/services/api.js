import axios from 'axios';

const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') 
  : 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Fallback initial state for offline/demo mode
export const MOCK_PROFILE = {
  full_name: 'Ayush Sharma',
  email: 'ayush@example.com',
  phone: '+91 9876543210',
  linkedin_url: 'https://linkedin.com/in/ayush-dev',
  github_url: 'https://github.com/ayush-dev',
  portfolio_url: 'https://ayush-dev.io',
  years_experience: 4.5,
  key_strengths: 'Python, React, TypeScript, FastAPI, System Architecture, SQL, Docker, Playwright',
  missing_keywords: 'Kubernetes, AWS Lambda, GraphQL, Terraform',
  resume_path: 'uploads/resume.pdf'
};

export const MOCK_SEARCH_CONFIG = {
  job_title: 'Full Stack Engineer',
  location: 'Bengaluru, India',
  is_remote: true,
  is_hybrid: false,
  easy_apply_only: true,
  max_applications_per_day: 25,
  auto_apply_active: true
};

export const MOCK_APPLICATIONS = [
  { id: 1, company: "Stripe", job_title: "Senior Full Stack Engineer", location: "Bengaluru / Remote", match_score: 96, status: "APPLIED", auto_apply_enabled: true, applied_at: "2026-08-03T10:00:00Z" },
  { id: 2, company: "Google", job_title: "Staff Software Engineer", location: "Bengaluru, KA", match_score: 92, status: "INTERVIEW", auto_apply_enabled: true, applied_at: "2026-08-02T15:30:00Z" },
  { id: 3, company: "Vercel", job_title: "Frontend Systems Engineer", location: "Remote", match_score: 98, status: "APPLIED", auto_apply_enabled: true, applied_at: "2026-08-02T11:20:00Z" },
  { id: 4, company: "Coinbase", job_title: "Backend Engineer (Python/FastAPI)", location: "Remote", match_score: 89, status: "APPLIED", auto_apply_enabled: false, applied_at: "2026-08-01T09:15:00Z" },
  { id: 5, company: "Datadog", job_title: "DevOps & Automation Engineer", location: "Bengaluru, KA", match_score: 84, status: "IN_PROGRESS", auto_apply_enabled: true, applied_at: "2026-08-01T14:40:00Z" },
  { id: 6, company: "Microsoft", job_title: "AI Application Developer", location: "Hyderabad / Remote", match_score: 95, status: "INTERVIEW", auto_apply_enabled: true, applied_at: "2026-07-31T16:50:00Z" }
];

export const MOCK_STATS = {
  applications_sent: 42,
  interviews_secured: 5,
  ai_match_rate: 94,
  jobs_today: 12,
  active_status: "IDLE"
};

// API Functions
export const getProfile = () => api.get('/profile').catch(() => ({ data: MOCK_PROFILE }));
export const updateProfile = (data) => api.put('/profile', data).catch(() => ({ data }));
export const uploadResume = (formData) => api.post('/profile/upload-resume', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).catch(() => ({
  data: {
    message: "Resume processed (Offline demo mode)",
    strengths: ["Python", "React", "TypeScript", "FastAPI", "Docker", "Playwright"],
    missing_keywords: ["Kubernetes", "AWS", "GraphQL"],
    profile: { ...MOCK_PROFILE, resume_path: "uploads/resume_uploaded.pdf" }
  }
}));

export const getSearchConfig = () => api.get('/search').catch(() => ({ data: MOCK_SEARCH_CONFIG }));
export const updateSearchConfig = (data) => api.put('/search', data).catch(() => ({ data }));

export const getApplications = () => api.get('/applications').catch(() => ({ data: MOCK_APPLICATIONS }));
export const createApplication = (data) => api.post('/applications', data).catch(() => ({
  data: { id: Date.now(), ...data, applied_at: new Date().toISOString() }
}));
export const deleteApplication = (id) => api.delete(`/applications/${id}`).catch(() => ({ data: { id } }));
export const toggleJobAutoApply = (appId) => api.patch(`/applications/${appId}/toggle-active`).catch(() => ({ data: { id: appId } }));

export const getStatsSummary = () => api.get('/applications/stats').catch(() => ({ data: MOCK_STATS }));
export const getBotLogs = () => api.get('/applications/logs').catch(() => ({ data: [] }));

export const startBot = (payload) => api.post('/automation/start', payload).catch(() => ({ data: { status: "started" } }));
export const stopBot = () => api.post('/automation/stop').catch(() => ({ data: { status: "stopped" } }));
export const getBotStatus = () => api.get('/automation/status').catch(() => ({ data: { running: false, completed: 0 } }));
export const getAutomationStats = () => api.get('/automation/stats').catch(() => ({ data: { total_applications: 42, platforms: {}, is_running: false } }));
export const getAvailablePlatforms = () => api.get('/automation/platforms').catch(() => ({
  data: {
    platforms: [
      { id: "linkedin", name: "LinkedIn", description: "Professional network with Easy Apply" },
      { id: "indeed", name: "Indeed", description: "Job board with Indeed Apply" },
      { id: "glassdoor", name: "Glassdoor", description: "Company reviews + job search" },
      { id: "naukri", name: "Naukri", description: "India's leading job portal" },
      { id: "wellfound", "name": "Wellfound (AngelList)", description: "Startup jobs" }
    ]
  }
}));

export const getWsUrl = () => {
  if (typeof window === 'undefined') return 'ws://localhost:8000/api/automation/ws/logs';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = process.env.NEXT_PUBLIC_WS_HOST || 'localhost:8000';
  return `${protocol}//${host}/api/automation/ws/logs`;
};

export default api;
