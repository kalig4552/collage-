import React from 'react';
import { BookOpen, Code2, RefreshCw, FileText, Database } from 'lucide-react';
import { PageSection } from '../types';

interface NavbarProps {
  currentSection: PageSection;
  onNavigate: (section: PageSection) => void;
  recordCount: number;
  onResetToSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onNavigate,
  recordCount,
  onResetToSample,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Product Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-100 tracking-tight">Library Analytics</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                Academic V5
              </span>
            </div>
            <p className="text-[11px] text-slate-400">College Library Management Data Analysis</p>
          </div>
        </div>

        {/* Academic Meta & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Active Data Pill */}
          <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>{recordCount.toLocaleString()} Records</span>
          </div>

          {/* Quick Reload Sample */}
          <button
            onClick={onResetToSample}
            title="Reload Built-in Sample Dataset (650 records)"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Dataset</span>
          </button>

          {/* Python Streamlit Source Code Tab */}
          <button
            onClick={() => onNavigate('python-project')}
            className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              currentSection === 'python-project'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python Source & ZIP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
