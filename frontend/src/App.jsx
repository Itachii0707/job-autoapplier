import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MissionControlView from './components/MissionControlView';
import JobBoardTrackerView from './components/JobBoardTrackerView';
import SmartProfileView from './components/SmartProfileView';

import {
  getProfile,
  updateProfile,
  uploadResume,
  getSearchConfig,
  updateSearchConfig,
  getApplications,
  toggleJobAutoApply,
  getStatsSummary,
  startBot,
  stopBot,
  getBotStatus,
  getAvailablePlatforms,
  getWsUrl
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('mission_control'); // mission_control, job_board, profile
  const [isBotRunning, setIsBotRunning] = useState(false);

  const [stats, setStats] = useState({ applications_sent: 42, interviews_secured: 5, ai_match_rate: 94, jobs_today: 12 });
  const [logs, setLogs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({
    full_name: 'Ayush Sharma',
    email: 'ayush@example.com',
    phone: '+91 9876543210',
    linkedin_url: 'https://linkedin.com/in/ayush-dev',
    github_url: 'https://github.com/ayush-dev',
    years_experience: 4.5,
    key_strengths: 'Python, React, TypeScript, FastAPI, System Architecture, SQL, Docker, Playwright',
    missing_keywords: 'Kubernetes, AWS Lambda, GraphQL, Terraform'
  });
  const [searchConfig, setSearchConfig] = useState({
    job_title: 'Full Stack Engineer',
    location: 'Bengaluru, India',
    is_remote: true,
    max_applications_per_day: 25
  });

  // Platform selection state
  const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin']);
  const [platforms, setPlatforms] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
    fetchPlatforms();

    // WebSocket connection for real-time bot execution logs
    const ws = new WebSocket(getWsUrl());
    ws.onmessage = (event) => {
      const logData = JSON.parse(event.data);
      setLogs((prevLogs) => [logData, ...prevLogs.slice(0, 49)]);
    };

    return () => ws.close();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [profRes, searchRes, appsRes, statsRes, statusRes] = await Promise.allSettled([
        getProfile(),
        getSearchConfig(),
        getApplications(),
        getStatsSummary(),
        getBotStatus()
      ]);

      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (searchRes.status === 'fulfilled') setSearchConfig(searchRes.value.data);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (statusRes.status === 'fulfilled') setIsBotRunning(statusRes.value.data.running);
    } catch (e) {
      console.warn("Using offline fallback mode:", e);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const res = await getAvailablePlatforms();
      setPlatforms(res.data.platforms || []);
    } catch (e) {
      console.warn('Could not fetch platforms:', e);
    }
  };

  const handleStartBot = async () => {
    try {
      await startBot({ platforms: selectedPlatforms });
      setIsBotRunning(true);
      setLogs((prev) => [{ message: `🚀 Multi-Platform Automation Engine started for: ${selectedPlatforms.join(', ')}`, level: 'SUCCESS', timestamp: new Date().toISOString() }, ...prev]);
    } catch (e) {
      console.error("Error starting bot:", e);
    }
  };

  const handleStopBot = async () => {
    try {
      await stopBot();
      setIsBotRunning(false);
      setLogs((prev) => [{ message: '🛑 Automation Engine stopped.', level: 'INFO', timestamp: new Date().toISOString() }, ...prev]);
    } catch (e) {
      console.error("Error stopping bot:", e);
    }
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      const res = await updateProfile(updatedData);
      setProfile(res.data);
      alert("Profile saved successfully!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSearchConfig = async (updatedSearch) => {
    try {
      const res = await updateSearchConfig(updatedSearch);
      setSearchConfig(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadResume = async (formData) => {
    try {
      const res = await uploadResume(formData);
      setProfile(res.data.profile);
      alert("Resume uploaded and analyzed!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAutoApply = async (appId) => {
    try {
      await toggleJobAutoApply(appId);
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, auto_apply_enabled: !app.auto_apply_enabled } : app));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Top Glassmorphic Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBotRunning={isBotRunning}
        onStartBot={handleStartBot}
        onStopBot={handleStopBot}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6">
        {activeTab === 'mission_control' && (
          <MissionControlView
            stats={stats}
            logs={logs}
            isBotRunning={isBotRunning}
            onStartBot={handleStartBot}
            onStopBot={handleStopBot}
            onFetchPlatforms={fetchPlatforms}
            platforms={platforms}
            selectedPlatforms={selectedPlatforms}
            setSelectedPlatforms={setSelectedPlatforms}
          />
        )}

        {activeTab === 'job_board' && (
          <JobBoardTrackerView applications={applications} onToggleAutoApply={handleToggleAutoApply} />
        )}

        {activeTab === 'profile' && (
          <SmartProfileView
            profile={profile}
            searchConfig={searchConfig}
            onSaveProfile={handleSaveProfile}
            onSaveSearchConfig={handleSaveSearchConfig}
            onUploadResume={handleUploadResume}
          />
        )}
      </main>
    </div>
  );
}
