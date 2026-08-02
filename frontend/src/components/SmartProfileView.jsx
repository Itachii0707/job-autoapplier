import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, Save, User, Mail, Phone, Link as LinkIcon, Briefcase, MapPin } from 'lucide-react';

export default function SmartProfileView({ profile, searchConfig, onSaveProfile, onSaveSearchConfig, onUploadResume }) {
  const [profileData, setProfileData] = useState(profile);
  const [searchData, setSearchData] = useState(searchConfig);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processUpload(file);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processUpload(file);
    }
  };

  const processUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    await onUploadResume(formData);
    setUploading(false);
  };

  const strengthsList = profileData.key_strengths ? profileData.key_strengths.split(',').map(s => s.trim()) : ["Python", "React", "TypeScript", "FastAPI", "SQL", "Docker", "Playwright"];
  const missingList = profileData.missing_keywords ? profileData.missing_keywords.split(',').map(s => s.trim()) : ["Kubernetes", "AWS Lambda", "GraphQL", "Terraform"];

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Smart Profile & Resume Analyzer</h2>
        <p className="text-sm text-slate-400 mt-1">Upload your resume to extract candidate metadata, analyze keyword match gaps, and configure job search parameters.</p>
      </div>

      {/* Grid Section: Resume Drag-Drop & Keyword Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Drag and Drop Upload Box with Hover SVG Particle Pulse */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-800">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Resume Document Upload</h3>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`mt-4 my-2 border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center relative overflow-hidden ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                : 'border-slate-700/80 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-900/80'
            }`}
          >
            {/* SVG Particle Pulse Backdrop effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#06B6D4" strokeWidth="2" className="animate-ping" />
              </svg>
            </div>

            <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
              <Upload className="w-8 h-8 animate-bounce" />
            </div>

            <h4 className="text-base font-semibold text-white">
              {uploading ? 'Parsing PDF Resume Text...' : 'Drag & drop your PDF resume here'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">Supports PDF format (Max 10MB)</p>

            <label className="mt-5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 btn-neon-glow cursor-pointer">
              <span>Browse File</span>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {profileData.resume_path && (
            <p className="text-xs font-mono text-emerald-400 text-center mt-2 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Resume Loaded: {profileData.resume_path.split('\\').pop().split('/').pop()}
            </p>
          )}
        </div>

        {/* Keyword Analysis Panel (Strengths vs Missing) */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">AI Resume Keyword Analysis</h3>
            </div>

            {/* Strengths (Soft Emerald) */}
            <div className="mt-4">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-2.5">
                <CheckCircle2 className="w-4 h-4" /> Detected Strengths & Core Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {strengthsList.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords (Soft Crimson) */}
            <div className="mt-6">
              <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1 mb-2.5">
                <AlertTriangle className="w-4 h-4" /> Recommended / Missing Keywords
              </label>
              <div className="flex flex-wrap gap-2">
                {missingList.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/25">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <p>💡 Tip: Adding missing keywords to your resume increases LLM match confidence during automated screening.</p>
          </div>
        </div>

      </div>

      {/* Candidate Profile Details Form */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" /> Candidate Profile Details
          </h3>
          <button
            onClick={() => onSaveProfile(profileData)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 btn-neon-glow cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Full Name</label>
            <input
              type="text"
              value={profileData.full_name || ''}
              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Email Address</label>
            <input
              type="email"
              value={profileData.email || ''}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Phone Number</label>
            <input
              type="text"
              value={profileData.phone || ''}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">LinkedIn Profile URL</label>
            <input
              type="text"
              value={profileData.linkedin_url || ''}
              onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">GitHub Profile URL</label>
            <input
              type="text"
              value={profileData.github_url || ''}
              onChange={(e) => setProfileData({ ...profileData, github_url: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Years of Experience</label>
            <input
              type="number"
              step="0.5"
              value={profileData.years_experience || 4.5}
              onChange={(e) => setProfileData({ ...profileData, years_experience: parseFloat(e.target.value) })}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
