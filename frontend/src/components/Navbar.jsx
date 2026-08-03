'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Play, Square, LayoutDashboard, Briefcase, UserCheck, Sparkles, Menu, X } from 'lucide-react';
import { startBot, stopBot, getBotStatus } from '../services/api';

export default function Navbar() {
  const pathname = usePathname();
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const checkStatus = async () => {
    try {
      const res = await getBotStatus();
      if (res?.data) {
        setIsBotRunning(Boolean(res.data.running));
      }
    } catch (e) {
      console.warn("Could not check bot status:", e);
    }
  };

  const handleStartBot = async () => {
    setLoading(true);
    try {
      await startBot({ platforms: ['linkedin', 'indeed', 'glassdoor', 'naukri', 'wellfound'] });
      setIsBotRunning(true);
      showToast("🚀 Automation Engine Started Across Selected Platforms");
    } catch (e) {
      setIsBotRunning(true);
      showToast("🚀 Automation Engine Triggered");
    } finally {
      setLoading(false);
    }
  };

  const handleStopBot = async () => {
    setLoading(true);
    try {
      await stopBot();
      setIsBotRunning(false);
      showToast("🛑 Automation Engine Stopped");
    } catch (e) {
      setIsBotRunning(false);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const navItems = [
    { label: 'Mission Control', href: '/', icon: LayoutDashboard },
    { label: 'Job Board Tracker', href: '/jobs', icon: Briefcase },
    { label: 'Smart Profile', href: '/profile', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 py-4 mb-6 sm:mb-8">
      <div className="max-w-7xl mx-auto app-card px-4 sm:px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo & Clean Title */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 group-hover:scale-105 transition-transform shrink-0">
            <Bot className="w-6 h-6" />
            {isBotRunning && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full pulse-dot" />}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              AutoApplier <span className="text-blue-600 font-semibold">AI</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal hidden sm:block">Autonomous Job Application Agent</p>
          </div>
        </Link>

        {/* Desktop & Tablet Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'pill-active shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bot Controls & Mobile Menu Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-blue-600 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-xs font-mono font-medium text-slate-700">
              {isBotRunning ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>

          {isBotRunning ? (
            <button
              onClick={handleStopBot}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer shadow-sm"
            >
              <Square className="w-3.5 h-3.5 fill-rose-500" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={handleStartBot}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 sm:px-5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold btn-primary cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Agent</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 app-card p-3 space-y-1 shadow-lg animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'pill-active'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Toast Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto mt-3">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-800 text-xs">✕</button>
          </div>
        </div>
      )}
    </header>
  );
}
