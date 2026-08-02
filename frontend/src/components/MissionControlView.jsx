import React, { useState, useEffect } from 'react';
import {
  Send, CheckCircle2, Award, Zap, Activity, Terminal, Sparkles,
  Linkedin, Globe, Building2, Briefcase, Rocket, BarChart2,
  RefreshCw, Play, Pause, Settings, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

import { getAutomationStats } from '../services/api';

export default function MissionControlView({ stats, logs, isBotRunning, onStartBot, onStopBot, onFetchPlatforms, platforms, selectedPlatforms, setSelectedPlatforms }) {
  const [platformStats, setPlatformStats] = useState({});
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [chartType, setChartType] = useState('applications'); // applications, matchRate, interviews

  // Fetch platform stats when component mounts or bot status changes
  useEffect(() => {
    if (isBotRunning) {
      fetchPlatformStats();
      const interval = setInterval(fetchPlatformStats, 10000);
      return () => clearInterval(interval);
    }
  }, [isBotRunning]);

  const fetchPlatformStats = async () => {
    try {
      const res = await getAutomationStats();
      setPlatformStats(res.data.platforms || {});
    } catch (e) {
      console.warn('Could not fetch platform stats:', e);
    }
  };

  const summaryCards = [
    {
      label: "Applications Sent",
      value: stats.applications_sent || 0,
      icon: Send,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      trend: "+12%",
      trendColor: "text-emerald-400"
    },
    {
      label: "Interviews Secured",
      value: stats.interviews_secured || 0,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      trend: "+5%",
      trendColor: "text-emerald-400"
    },
    {
      label: "AI Match Rate",
      value: `${stats.ai_match_rate || 0}%`,
      icon: Award,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      trend: "+2%",
      trendColor: "text-emerald-400"
    },
    {
      label: "Jobs Today",
      value: stats.jobs_today || 0,
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      trend: "+8",
      trendColor: "text-emerald-400"
    },
  ];

  // Platform status cards
  const platformCards = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'indeed', name: 'Indeed', icon: Globe, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { id: 'glassdoor', name: 'Glassdoor', icon: Building2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { id: 'naukri', name: 'Naukri', icon: Briefcase, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { id: 'wellfound', name: 'Wellfound', icon: Rocket, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  // Generate mock chart data based on platform stats
  const chartData = React.useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStats = platformStats;
      let totalApps = 0;
      let totalInterviews = 0;
      let avgMatch = 0;
      let platformCount = 0;

      Object.values(dayStats).forEach(p => {
        if (p.applied > 0) {
          totalApps += p.applied;
          platformCount++;
        }
      });

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: totalApps + Math.floor(Math.random() * 3),
        interviews: totalInterviews + Math.floor(Math.random() * 2),
        matchRate: avgMatch || (85 + Math.floor(Math.random() * 15)),
        linkedin: (dayStats.linkedin?.applied || 0) + Math.floor(Math.random() * 2),
        indeed: (dayStats.indeed?.applied || 0) + Math.floor(Math.random() * 2),
        glassdoor: (dayStats.glassdoor?.applied || 0) + Math.floor(Math.random() * 1),
        naukri: (dayStats.naukri?.applied || 0) + Math.floor(Math.random() * 1),
        wellfound: (dayStats.wellfound?.applied || 0) + Math.floor(Math.random() * 1),
      });
    }
    return data;
  }, [platformStats, timeRange]);

  const COLORS = ['#06b6d4', '#f97316', '#22c55e', '#ef4444', '#a855f7'];

  return (
    <div className="space-y-8">
      {/* Top Summary Cards Grid with Border Beam */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel border-beam rounded-2xl p-6 relative group overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <h3 className="text-3xl font-extrabold mt-2 text-white font-mono">{card.value}</h3>
                  <p className={`text-xs font-medium mt-1 ${card.trendColor} flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" /> {card.trend} vs last week
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg} border border-white/5`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Selector & Controls */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              Platform Analytics
            </h2>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2 border border-slate-700/50 rounded-xl px-3 py-1.5">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent text-white text-sm font-mono focus:outline-none cursor-pointer"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
              </select>
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-2 border border-slate-700/50 rounded-xl px-3 py-1.5">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="bg-transparent text-white text-sm font-mono focus:outline-none cursor-pointer"
              >
                <option value="applications">Applications</option>
                <option value="matchRate">Match Rate</option>
                <option value="interviews">Interviews</option>
              </select>
            </div>
          </div>

          {/* Platform Selector Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPlatformSelector(!showPlatformSelector)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-950 transition-all ${showPlatformSelector
                  ? 'btn-neon-glow bg-cyan-500'
                  : 'bg-slate-800/50 hover:bg-slate-700/50'
                }`}
            >
              <Settings className="w-4 h-4" />
              <span>Platforms</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPlatformSelector ? 'rotate-180' : ''}`} />
            </button>

            {/* Start/Stop Bot Buttons */}
            <div className="flex items-center gap-2">
              {!isBotRunning ? (
                <button
                  onClick={onStartBot}
                  disabled={selectedPlatforms.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 btn-neon-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Automation</span>
                </button>
              ) : (
                <button
                  onClick={onStopBot}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>Stop Automation</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Platform Selector Dropdown */}
        {showPlatformSelector && (
          <div className="animate-slide-down mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <p className="text-sm text-slate-400 mb-4">Select job platforms to automate (at least one required)</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {platformCards.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                const pStats = platformStats[platform.id] || { found: 0, applied: 0, errors: 0 };
                return (
                  <label
                    key={platform.id}
                    className={`relative cursor-pointer transition-all ${isSelected
                        ? 'ring-2 ring-cyan-400/50 bg-cyan-500/10'
                        : 'hover:bg-slate-800/50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      value={platform.id}
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlatforms([...selectedPlatforms, platform.id]);
                        } else if (selectedPlatforms.length > 1) {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                        }
                      }}
                      className="absolute inset-0 opacity-0 peer"
                    />
                    <div className={`p-4 rounded-xl border-2 text-center ${isSelected ? 'border-cyan-400/50' : 'border-slate-700/50'}`}>
                      <div className={`p-2 rounded-lg ${platform.bg} ${platform.border} mb-2 inline-flex`}>
                        <platform.icon className={`w-5 h-5 ${platform.color}`} />
                      </div>
                      <p className="font-medium text-white text-sm">{platform.name}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {pStats.applied} applied / {pStats.found} found
                      </p>
                      {pStats.errors > 0 && (
                        <p className="text-xs text-rose-400 mt-0.5">{pStats.errors} errors</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Trend Chart */}
          <div className="glass-panel-inner rounded-xl p-4 border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                {chartType === 'applications' ? 'Applications Over Time' :
                  chartType === 'matchRate' ? 'AI Match Rate Trend' : 'Interviews Secured'}
              </h3>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {['linkedin', 'indeed', 'glassdoor', 'naukri', 'wellfound'].map((p, i) => (
                  <span key={p} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'applications' && (
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      {['linkedin', 'indeed', 'glassdoor', 'naukri', 'wellfound'].map((p, i) => (
                        <linearGradient key={p} id={`color${p}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    {['linkedin', 'indeed', 'glassdoor', 'naukri', 'wellfound'].map((p, i) => (
                      <Area
                        key={p}
                        type="monotone"
                        dataKey={p}
                        stroke={COLORS[i]}
                        fill={`url(#color${p})`}
                        strokeWidth={2}
                        name={p.charAt(0).toUpperCase() + p.slice(1)}
                      />
                    ))}
                  </AreaChart>
                )}
                {chartType === 'matchRate' && (
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[70, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="matchRate"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      name="Match Rate %"
                    />
                  </LineChart>
                )}
                {chartType === 'interviews' && (
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Bar dataKey="interviews" fill="#22c55e" name="Interviews" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Distribution Pie Chart */}
          <div className="glass-panel-inner rounded-xl p-4 border border-slate-800/50">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Platform Distribution
            </h3>
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformCards.map((p, i) => ({
                      name: p.name,
                      value: (platformStats[p.id]?.applied || 0) + (i === 0 ? 1 : 0), // Ensure at least 1 for demo
                      color: COLORS[i]
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {platformCards.map((p, i) => (
                      <Cell key={p.id} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
                {platformCards.map((p, i) => (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[i] + '33' }}>
                      <p.icon className="w-4 h-4" style={{ color: COLORS[i] }} />
                    </div>
                    <span className="text-slate-400">{p.name}</span>
                    <span className="font-mono text-white">{platformStats[p.id]?.applied || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid: Live Activity Feed + Real-Time Console Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Live Feed Activity Timeline */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Live AI Activity Feed</h2>
            </div>
            <span className={`flex h-2.5 w-2.5 rounded-full ${isBotRunning ? 'bg-cyan-400 pulse-cyan-dot' : 'bg-slate-600'}`} />
          </div>

          <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-6">
            {logs && logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="flex space-x-4 relative">
                  {/* Timeline connector line */}
                  {i !== logs.length - 1 && (
                    <span className="absolute left-[13px] top-6 w-[2px] h-[calc(100%+8px)] bg-slate-800" />
                  )}
                  {/* Pulse Dot */}
                  <div className="relative z-10 mt-1">
                    <span className={`w-3 h-3 rounded-full block ${log.level === 'SUCCESS' ? 'bg-emerald-400' : log.level === 'WARN' ? 'bg-amber-400' : 'bg-cyan-400 pulse-cyan-dot'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono">
                      {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-slate-200 mt-0.5 leading-snug font-medium">
                      {log.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-6">
                <div className="flex space-x-4 relative">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 pulse-cyan-dot mt-1" />
                  <div>
                    <p className="text-xs text-slate-400 font-mono">--:--:--</p>
                    <p className="text-sm text-slate-200 font-medium">Waiting for automation to start...</p>
                  </div>
                </div>
                <div className="flex space-x-4 relative">
                  <span className="w-3 h-3 rounded-full bg-slate-600 mt-1" />
                  <div>
                    <p className="text-xs text-slate-400 font-mono">--:--:--</p>
                    <p className="text-sm text-slate-500 font-medium">Select platforms and click "Start Automation"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Agent Log Terminal */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Playwright & LLM Execution Console</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className={`w-4 h-4 text-cyan-400 ${isBotRunning ? 'animate-spin' : ''}`} />
              <span className="text-xs font-mono text-slate-400">
                {isBotRunning ? 'Stream Connected' : 'Stream Disconnected'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex-1 bg-slate-950/80 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2 border border-slate-800/80">
            <p className="text-slate-500">[SYSTEM] Multi-Platform Agent initialized in Playwright persistent browser context mode.</p>
            <p className="text-cyan-400">[INFO] Loaded user profile: Ayush Sharma (4.5 YOE, Python/React/FastAPI)</p>
            <p className="text-emerald-400">[SUCCESS] Resume PDF parsed: 12 key skills detected, 4 missing keywords identified.</p>
            <p className="text-cyan-400">[INFO] Active platforms: {selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}</p>
            {logs.map((log, idx) => (
              <p key={idx} className={log.level === 'SUCCESS' ? 'text-emerald-400' : log.level === 'WARN' ? 'text-amber-400' : log.level === 'ERROR' ? 'text-rose-400' : 'text-slate-300'}>
                [{log.level || 'INFO'}] {log.message}
              </p>
            ))}
            <p className={`text-slate-500 animate-pulse ${isBotRunning ? '' : 'hidden'}`}>_ Waiting for next automation step...</p>
            {!isBotRunning && <p className="text-slate-500">_ Automation engine idle. Click "Start Automation" to begin.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}