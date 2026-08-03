'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2, MapPin, Sparkles, CheckCircle, Clock,
  Plus, Search, Trash2, ArrowUpRight, X, ShieldCheck
} from 'lucide-react';
import { getApplications, createApplication, deleteApplication, toggleJobAutoApply, MOCK_APPLICATIONS } from '../../services/api';

export default function JobBoardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [newJob, setNewJob] = useState({
    company: '',
    job_title: '',
    location: 'Remote',
    job_url: '',
    match_score: 92,
    status: 'APPLIED',
    auto_apply_enabled: true
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getApplications();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setApplications(res.data);
      } else {
        setApplications(MOCK_APPLICATIONS);
      }
    } catch (e) {
      console.warn("Using mock applications data:", e);
      setApplications(MOCK_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoApply = async (appId) => {
    try {
      await toggleJobAutoApply(appId);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, auto_apply_enabled: !app.auto_apply_enabled } : app))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJob = async (appId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this job role?")) return;
    try {
      await deleteApplication(appId);
      setApplications((prev) => prev.filter((app) => app.id !== appId));
    } catch (e) {
      setApplications((prev) => prev.filter((app) => app.id !== appId));
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.company || !newJob.job_title) {
      alert("Please fill in Company name and Job Title.");
      return;
    }
    try {
      const res = await createApplication(newJob);
      setApplications((prev) => [res.data, ...prev]);
      setShowAddModal(false);
      setNewJob({ company: '', job_title: '', location: 'Remote', job_url: '', match_score: 92, status: 'APPLIED', auto_apply_enabled: true });
    } catch (e) {
      const fallbackJob = { id: Date.now(), ...newJob, applied_at: new Date().toISOString() };
      setApplications((prev) => [fallbackJob, ...prev]);
      setShowAddModal(false);
    }
  };

  const filteredJobs = applications.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Applied
          </span>
        );
      case 'INTERVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Interview
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Queued
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Job Board Tracker
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
              {filteredJobs.length} Roles
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 sm:mt-1">
            Track applications, monitor match scores, and toggle auto-apply settings.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold btn-primary cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Target Job</span>
        </button>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="app-card p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by company, title, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full app-input pl-10 pr-4 py-2 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'APPLIED', label: 'Applied' },
            { id: 'INTERVIEW', label: 'Interview' },
            { id: 'IN_PROGRESS', label: 'In Progress' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'pill-active'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Bento Grid */}
      {loading ? (
        <div className="text-center py-16 sm:py-20">
          <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading Target Jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="app-card p-8 sm:p-12 text-center">
          <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">No Jobs Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No jobs match your current search or status filter.'
              : 'Your queue is empty. Click "Add Target Job" to start tracking.'}
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setShowAddModal(true); }}
            className="mt-5 px-5 py-2.5 rounded-xl text-xs font-semibold btn-primary cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-white" /> Add Target Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="app-card p-5 sm:p-6 relative flex flex-col justify-between group cursor-pointer hover:border-blue-300"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                      {job.company ? job.company.charAt(0) : 'C'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate">
                        {job.job_title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.company}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    {job.match_score || 94}% Match
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-slate-600 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.location || 'Remote'}
                  </span>
                  {getStatusBadge(job.status)}
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-slate-700">Auto-Apply</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleAutoApply(job.id); }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                      job.auto_apply_enabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-xs ${
                        job.auto_apply_enabled ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {job.job_url && (
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-blue-600 border border-slate-200"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={(e) => handleDeleteJob(job.id, e)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-rose-600 border border-slate-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Target Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Add Target Job
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, OpenAI"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={newJob.job_title}
                  onChange={(e) => setNewJob({ ...newJob, job_title: e.target.value })}
                  className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / Bengaluru"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Match Score (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newJob.match_score}
                    onChange={(e) => setNewJob({ ...newJob, match_score: parseInt(e.target.value) || 85 })}
                    className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Application URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/..."
                  value={newJob.job_url}
                  onChange={(e) => setNewJob({ ...newJob, job_url: e.target.value })}
                  className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold btn-primary cursor-pointer"
                >
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-card max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  {selectedJob.company ? selectedJob.company.charAt(0) : 'C'}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{selectedJob.job_title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" /> {selectedJob.company} • {selectedJob.location || 'Remote'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-1">AI Match Confidence</span>
                  <span className="text-base font-bold text-blue-700">{selectedJob.match_score || 94}%</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-1">Status</span>
                  {getStatusBadge(selectedJob.status)}
                </div>
              </div>

              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-1.5">
                <span className="text-blue-900 font-bold block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Automation Status
                </span>
                <p className="text-slate-700 leading-relaxed font-normal">
                  Stealth session context configured. The AI engine is set to extract custom form fields and apply via Playwright.
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end border-t border-slate-200">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
