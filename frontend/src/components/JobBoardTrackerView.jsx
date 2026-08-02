import React from 'react';
import { Building2, MapPin, ExternalLink, Sparkles, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function JobBoardTrackerView({ applications, onToggleAutoApply }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Applied</span>;
      case 'INTERVIEW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Interview</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Clock className="w-3 h-3 animate-spin" /> In Progress</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Queued</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Job Board & Automator Tracker</h2>
          <p className="text-sm text-slate-400 mt-1">Manage target roles, monitor AI match scores, and toggle per-job automation.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
            {applications.length} Target Roles Active
          </span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((job) => (
          <div key={job.id} className="glass-panel rounded-2xl p-6 relative flex flex-col justify-between group">
            
            {/* Top Row: Company Avatar + Title + Match Badge */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-lg text-cyan-400 shadow-inner">
                    {job.company ? job.company.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                      {job.job_title}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {job.company}
                    </p>
                  </div>
                </div>

                {/* AI Match Badge */}
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {job.match_score || 94}% Match
                </span>
              </div>

              {/* Location & Status Info */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location || 'Remote'}
                </span>
                {getStatusBadge(job.status)}
              </div>
            </div>

            {/* Bottom Row: Interactive Auto-Apply Toggle Switch */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Auto-Apply Active</span>
              
              <button
                onClick={() => onToggleAutoApply(job.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  job.auto_apply_enabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    job.auto_apply_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
