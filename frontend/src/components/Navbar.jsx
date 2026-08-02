import React from 'react';
import { Bot, Play, Square, Sparkles, LayoutDashboard, Briefcase, UserCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isBotRunning, onStartBot, onStopBot }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30">
            <Bot className="w-6 h-6 text-cyan-400" />
            {isBotRunning && <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full pulse-cyan-dot" />}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              AutoApplier<span className="text-cyan-400 font-mono text-xs ml-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">AI 2.5</span>
            </h1>
            <p className="text-xs text-slate-400">Autonomous Job Application Agent</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('mission_control')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'mission_control'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Mission Control</span>
          </button>

          <button
            onClick={() => setActiveTab('job_board')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'job_board'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Board & Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Smart Profile</span>
          </button>
        </nav>

        {/* Bot Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
            <span className={`w-2.5 h-2.5 rounded-full ${isBotRunning ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-xs font-mono font-medium text-slate-300">
              {isBotRunning ? 'BOT ACTIVE' : 'IDLE'}
            </span>
          </div>

          {isBotRunning ? (
            <button
              onClick={onStopBot}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-rose-400" />
              <span>Stop Agent</span>
            </button>
          ) : (
            <button
              onClick={onStartBot}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 btn-neon-glow cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Run AI Applier</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
