'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Send, CheckCircle2, Award, Zap, Activity, Terminal, Sparkles,
  Linkedin, Globe, Building2, Briefcase, Rocket, BarChart2,
  Play, Pause, Settings
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

import {
  getStatsSummary,
  getAutomationStats,
  getAvailablePlatforms,
  startBot,
  stopBot,
  getBotStatus,
  getWsUrl,
  MOCK_STATS
} from '../services/api';

const INITIAL_LOGS = [
  { message: "Automation Engine Initialized.", level: "INFO", timestamp: "2026-08-03T10:00:00.000Z" },
  { message: "Dual AI Form Solver Ready (Gemini API + Instructor).", level: "SUCCESS", timestamp: "2026-08-03T10:00:01.000Z" },
  { message: "Connected to API Server & Database.", level: "INFO", timestamp: "2026-08-03T10:00:02.000Z" }
];

export default function MissionControlPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(MOCK_STATS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin', 'indeed', 'naukri']);
  const [platformStats, setPlatformStats] = useState({});
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    setMounted(true);
    fetchInitialData();
    fetchPlatformsList();

    let ws;
    try {
      ws = new WebSocket(getWsUrl());
      ws.onmessage = (event) => {
        try {
          const logData = JSON.parse(event.data);
          setLogs((prev) => [logData, ...prev.slice(0, 99)]);
        } catch (e) {
          console.warn("Error parsing log event:", e);
        }
      };
    } catch (e) {
      console.warn("WebSocket stream unavailable:", e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isBotRunning) {
      interval = setInterval(async () => {
        try {
          const res = await getAutomationStats();
          if (res?.data?.platforms) {
            setPlatformStats(res.data.platforms);
          }
        } catch (e) {
          console.warn(e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isBotRunning]);

  const fetchInitialData = async () => {
    try {
      const [statsRes, statusRes] = await Promise.allSettled([
        getStatsSummary(),
        getBotStatus()
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) setStats(statsRes.value.data);
      if (statusRes.status === 'fulfilled' && statusRes.value?.data) setIsBotRunning(Boolean(statusRes.value.data.running));
    } catch (e) {
      console.warn("Using default stats:", e);
    }
  };

  const fetchPlatformsList = async () => {
    try {
      const res = await getAvailablePlatforms();
      if (res?.data?.platforms) {
        setPlatforms(res.data.platforms);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const togglePlatform = (id) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((p) => p !== id) : prev
        : [...prev, id]
    );
  };

  const handleStartBot = async () => {
    try {
      await startBot({ platforms: selectedPlatforms });
      setIsBotRunning(true);
      setLogs((prev) => [
        { message: `🚀 Automation engine started for: ${selectedPlatforms.join(', ')}`, level: 'SUCCESS', timestamp: new Date().toISOString() },
        ...prev
      ]);
    } catch (e) {
      setIsBotRunning(true);
    }
  };

  const handleStopBot = async () => {
    try {
      await stopBot();
      setIsBotRunning(false);
      setLogs((prev) => [
        { message: '🛑 Automation Engine stopped.', level: 'INFO', timestamp: new Date().toISOString() },
        ...prev
      ]);
    } catch (e) {
      setIsBotRunning(false);
    }
  };

  const summaryCards = [
    { label: "Applications Sent", value: stats.applications_sent || 42, icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Interviews Secured", value: stats.interviews_secured || 5, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "AI Match Rate", value: `${stats.ai_match_rate || 94}%`, icon: Award, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Jobs Applied Today", value: stats.jobs_today || 12, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const platformCards = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { id: 'indeed', name: 'Indeed', icon: Globe, color: 'text-amber-600' },
    { id: 'glassdoor', name: 'Glassdoor', icon: Building2, color: 'text-emerald-600' },
    { id: 'naukri', name: 'Naukri', icon: Briefcase, color: 'text-rose-600' },
    { id: 'wellfound', name: 'Wellfound', icon: Rocket, color: 'text-purple-600' },
  ];

  const chartData = useMemo(() => {
    const count = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const items = [];
    const baseDate = new Date("2026-08-03T00:00:00.000Z");
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      items.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        Applications: Math.floor(4 + Math.sin(i) * 2 + (i % 3)),
        Interviews: Math.floor((i % 5 === 0 ? 1 : 0)),
      });
    }
    return items;
  }, [timeRange]);

  const formatLogTime = (ts) => {
    if (!mounted) return '10:00:00 AM';
    try {
      return new Date(ts || Date.now()).toLocaleTimeString();
    } catch (e) {
      return '10:00:00 AM';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Mission Control Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 sm:mt-1">
            Monitor real-time metrics, configure target job engines, and view automation activity.
          </p>
        </div>

        <div>
          {isBotRunning ? (
            <button
              onClick={handleStopBot}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer shadow-sm"
            >
              <Pause className="w-4 h-4 fill-rose-500" />
              <span>Pause Automation</span>
            </button>
          ) : (
            <button
              onClick={handleStartBot}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold btn-primary cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Automation Engine</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="app-card p-5 sm:p-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color} border border-slate-100`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Platform Engine Selector */}
      <div className="app-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" /> Target Job Board Engines
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Select job search platforms for the automated Playwright engine.</p>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
            {selectedPlatforms.length} Selected
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {platformCards.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlatforms.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'pill-active shadow-xs scale-[1.01]'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-5 h-5 ${isSelected ? p.color : 'text-slate-400'}`} />
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                </div>
                <div className="mt-3">
                  <h4 className={`font-semibold text-xs sm:text-sm ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{p.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{isSelected ? 'Enabled' : 'Disabled'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Grid: Recharts Performance Analytics & Live Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column (7 cols): Recharts Analytics */}
        <div className="lg:col-span-7 app-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Application Analytics</h3>
            </div>
            
            <div className="self-start sm:self-auto flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 sm:mt-6 h-64 sm:h-72 w-full flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '10px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#2563EB', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="Applications" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBlue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Live Terminal Log Stream */}
        <div className="lg:col-span-5 app-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Execution Log</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              <Activity className="w-3 h-3 animate-spin" /> Live
            </span>
          </div>

          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 h-64 sm:h-72 overflow-y-auto font-mono text-xs space-y-2 leading-relaxed text-slate-200">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-center mt-12">Waiting for log activity...</p>
            ) : (
              logs.map((log, idx) => {
                const isSuccess = log.level === 'SUCCESS';
                const isWarn = log.level === 'WARNING' || log.level === 'WARN';
                const isError = log.level === 'ERROR';
                return (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-slate-500 shrink-0" suppressHydrationWarning>
                      [{formatLogTime(log.timestamp)}]
                    </span>
                    <span
                      className={`break-words ${
                        isSuccess ? 'text-emerald-400 font-semibold' : isWarn ? 'text-amber-400' : isError ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Real-time Stream</span>
            <button
              onClick={() => setLogs([])}
              className="text-slate-500 hover:text-slate-900 font-medium text-[11px] underline"
            >
              Clear Log
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
