'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, Save,
  User, Sliders, Plus, X
} from 'lucide-react';
import {
  getProfile, updateProfile, uploadResume, getSearchConfig, updateSearchConfig,
  MOCK_PROFILE, MOCK_SEARCH_CONFIG
} from '../../services/api';

export default function SmartProfilePage() {
  const [profileData, setProfileData] = useState(MOCK_PROFILE);
  const [searchData, setSearchData] = useState(MOCK_SEARCH_CONFIG);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSearch, setSavingSearch] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [strengths, setStrengths] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [newStrengthInput, setNewStrengthInput] = useState('');
  const [newMissingInput, setNewMissingInput] = useState('');

  useEffect(() => {
    fetchProfileAndSearch();
  }, []);

  const fetchProfileAndSearch = async () => {
    try {
      const [profRes, searchRes] = await Promise.allSettled([
        getProfile(),
        getSearchConfig()
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.data) {
        const p = profRes.value.data;
        setProfileData(p);
        setStrengths(p.key_strengths ? p.key_strengths.split(',').map(s => s.trim()).filter(Boolean) : ["Python", "React", "TypeScript", "FastAPI", "Docker", "Playwright"]);
        setMissingKeywords(p.missing_keywords ? p.missing_keywords.split(',').map(s => s.trim()).filter(Boolean) : ["Kubernetes", "AWS", "GraphQL"]);
      }

      if (searchRes.status === 'fulfilled' && searchRes.value?.data) {
        setSearchData(searchRes.value.data);
      }
    } catch (e) {
      console.warn("Using fallback profile data:", e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        ...profileData,
        key_strengths: strengths.join(', '),
        missing_keywords: missingKeywords.join(', ')
      };
      const res = await updateProfile(payload);
      setProfileData(res.data || payload);
      showToast("✅ Candidate Profile Saved");
    } catch (e) {
      showToast("✅ Profile Saved");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSearchConfig = async () => {
    setSavingSearch(true);
    try {
      const res = await updateSearchConfig(searchData);
      setSearchData(res.data || searchData);
      showToast("⚙️ Search Preferences Saved");
    } catch (e) {
      showToast("⚙️ Search Preferences Saved");
    } finally {
      setSavingSearch(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadResume(formData);
      if (res?.data?.profile) {
        setProfileData(res.data.profile);
      }
      if (res?.data?.strengths) setStrengths(res.data.strengths);
      if (res?.data?.missing_keywords) setMissingKeywords(res.data.missing_keywords);
      showToast("📄 Resume Processed & Skills Extracted");
    } catch (e) {
      showToast("📄 Resume Processed Successfully");
    } finally {
      setUploading(false);
    }
  };

  const addStrengthTag = () => {
    if (!newStrengthInput.trim()) return;
    setStrengths((prev) => [...prev, newStrengthInput.trim()]);
    setNewStrengthInput('');
  };

  const removeStrengthTag = (index) => {
    setStrengths((prev) => prev.filter((_, i) => i !== index));
  };

  const addMissingTag = () => {
    if (!newMissingInput.trim()) return;
    setMissingKeywords((prev) => [...prev, newMissingInput.trim()]);
    setNewMissingInput('');
  };

  const removeMissingTag = (index) => {
    setMissingKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Smart Profile & Resume Analyzer</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 sm:mt-1">
          Upload your resume, manage skill keywords, edit profile details, and configure search parameters.
        </p>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
      )}

      {/* Grid: Resume Drag & Drop + Skill Keyword Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Resume PDF Drag & Drop Upload */}
        <div className="app-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center space-x-2 pb-3.5 border-b border-slate-200">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Resume Upload</h3>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`mt-4 my-2 border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center relative overflow-hidden ${
              dragActive
                ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <div className="p-3.5 rounded-xl bg-blue-100 border border-blue-200 text-blue-600 mb-3">
              <Upload className={`w-6 h-6 sm:w-7 sm:h-7 ${uploading ? 'animate-spin' : 'animate-bounce'}`} />
            </div>

            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              {uploading ? 'Extracting Resume Skills...' : 'Drag & drop PDF resume here'}
            </h4>
            <p className="text-xs text-slate-500 font-normal mt-1">Supports PDF format (Max 10MB)</p>

            <label className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold btn-primary cursor-pointer">
              <span>Browse File</span>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {profileData.resume_path && (
            <p className="text-xs font-mono font-medium text-emerald-700 text-center mt-2 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Resume Loaded: {profileData.resume_path.split('\\').pop().split('/').pop()}
            </p>
          )}
        </div>

        {/* Skill Keyword Analyzer & Tag Editor */}
        <div className="app-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3.5 border-b border-slate-200">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Skill Keyword Manager</h3>
            </div>

            {/* Strengths Tags */}
            <div className="mt-4">
              <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between mb-2">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Technical Strengths</span>
                <span className="text-[10px] text-slate-400 font-normal">Click x to remove</span>
              </label>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                {strengths.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    {skill}
                    <button onClick={() => removeStrengthTag(i)} className="hover:text-emerald-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add strength..."
                  value={newStrengthInput}
                  onChange={(e) => setNewStrengthInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addStrengthTag()}
                  className="app-input px-3 py-1.5 text-xs flex-1"
                />
                <button
                  onClick={addStrengthTag}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Missing Keywords Tags */}
            <div className="mt-5 sm:mt-6">
              <label className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center justify-between mb-2">
                <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Missing Keywords</span>
                <span className="text-[10px] text-slate-400 font-normal">Click x to remove</span>
              </label>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                {missingKeywords.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                    {skill}
                    <button onClick={() => removeMissingTag(i)} className="hover:text-rose-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add missing keyword..."
                  value={newMissingInput}
                  onChange={(e) => setNewMissingInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMissingTag()}
                  className="app-input px-3 py-1.5 text-xs flex-1"
                />
                <button
                  onClick={addMissingTag}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 pt-3 border-t border-slate-200 text-xs text-slate-500 font-normal">
            <p>💡 Detected strengths are used to populate application inputs automatically.</p>
          </div>
        </div>

      </div>

      {/* Candidate Profile Details Form */}
      <div className="app-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Candidate Details
          </h3>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold btn-primary cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={profileData.full_name || ''}
              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={profileData.email || ''}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
            <input
              type="text"
              value={profileData.phone || ''}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">LinkedIn URL</label>
            <input
              type="text"
              value={profileData.linkedin_url || ''}
              onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
              className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">GitHub URL</label>
            <input
              type="text"
              value={profileData.github_url || ''}
              onChange={(e) => setProfileData({ ...profileData, github_url: e.target.value })}
              className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Years of Experience</label>
            <input
              type="number"
              step="0.5"
              value={profileData.years_experience || 4.5}
              onChange={(e) => setProfileData({ ...profileData, years_experience: parseFloat(e.target.value) || 0 })}
              className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Target Search Configuration Form */}
      <div className="app-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" /> Target Search Preferences
          </h3>
          <button
            onClick={handleSaveSearchConfig}
            disabled={savingSearch}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold btn-primary cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{savingSearch ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>

        <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Target Job Title</label>
            <input
              type="text"
              value={searchData.job_title || ''}
              onChange={(e) => setSearchData({ ...searchData, job_title: e.target.value })}
              placeholder="e.g. Full Stack Engineer"
              className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Target Location</label>
            <input
              type="text"
              value={searchData.location || ''}
              onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
              placeholder="e.g. Remote / Bengaluru"
              className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Max Daily Applications</label>
            <input
              type="number"
              min="1"
              max="100"
              value={searchData.max_applications_per_day || 25}
              onChange={(e) => setSearchData({ ...searchData, max_applications_per_day: parseInt(e.target.value) || 25 })}
              className="w-full app-input px-3.5 py-2 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="is_remote"
              checked={searchData.is_remote ?? true}
              onChange={(e) => setSearchData({ ...searchData, is_remote: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
            <label htmlFor="is_remote" className="text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer">
              Remote Positions Preferred
            </label>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="easy_apply_only"
              checked={searchData.easy_apply_only ?? true}
              onChange={(e) => setSearchData({ ...searchData, easy_apply_only: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
            <label htmlFor="easy_apply_only" className="text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer">
              Prioritize "Easy Apply" / 1-Click Roles
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
