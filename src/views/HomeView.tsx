import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  BookOpen,
  Award,
} from 'lucide-react';
import { PageSection } from '../types';

interface HomeViewProps {
  onNavigate: (section: PageSection) => void;
  recordCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, recordCount }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-900/20 border border-slate-800 rounded-2xl p-8 sm:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono tracking-wider uppercase">
            <span>B.Sc. Data Science Academic Project</span>
            <span aria-hidden="true">·</span>
            <span>Semester V</span>
            <span aria-hidden="true">·</span>
            <span>University of Mumbai</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            College Library Management Data Analysis
          </h1>

          <p className="text-lg text-slate-300 font-medium">
            Data-driven insights for better library management
          </p>

          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            A production-ready, fully functional, 100% local and API-free decision support platform.
            Transforms unstructured circulation records into dynamic executive dashboards, exploratory data
            distributions, student borrower segmentation, overdue fine accounting, and deterministic inventory
            recommendations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('dataset')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Upload Dataset</span>
            </button>

            <button
              onClick={() => onNavigate('python-project')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>View Python Streamlit Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">100% API-Free & Local First</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Zero cloud databases, zero external API keys, and zero telemetry. All operations run in-memory
            with absolute privacy and reproducibility.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Dynamic Multi-Dimensional Analytics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every KPI card, distribution curve, and ranking table dynamically recalculates over custom
            cross-filters (Course, Academic Year, Gender, Category, Status).
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Rule-Based Inventory Directives</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mathematical demand velocity versus shelf availability triggers deterministic procurement advice
            without non-deterministic AI hallucinations.
          </p>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100">Academic Data Science Methodology Workflow</h2>
            <p className="text-xs text-slate-400">Complete rigorous ten-step analytical pipeline from raw ledger to decision report</p>
          </div>
          <span className="text-xs font-mono text-indigo-400 px-2.5 py-1 bg-indigo-950/60 rounded border border-indigo-800/50">
            End-to-End Pipeline
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          {[
            { step: '01', title: 'Data Collection', desc: 'Raw circulation logs with 20 structural schema attributes' },
            { step: '02', title: 'Data Cleaning', desc: 'Deduplication, whitespace trim, null audit & title casing' },
            { step: '03', title: 'Data Preprocessing', desc: 'ISO date normalization & chronological order check' },
            { step: '04', title: 'Feature Engineering', desc: 'Derivation of Loan_Days, Overdue_Days & quarter tokens' },
            { step: '05', title: 'Exploratory Analysis', desc: 'Parametric central tendencies & demographic profiling' },
            { step: '06', title: 'Data Visualization', desc: 'Dynamic temporal trends & category affinity distributions' },
            { step: '07', title: 'Statistical Analysis', desc: 'Pearson correlation matrices & course crosstabs' },
            { step: '08', title: 'Insight Generation', desc: 'Overdue delinquency ratios & borrowing peak detection' },
            { step: '09', title: 'Recommendations', desc: 'Deterministic stock replenishment heuristics' },
            { step: '10', title: 'Reporting & Exports', desc: 'Audit-ready CSV tables & formal project documentation' },
          ].map(m => (
            <div key={m.step} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 font-bold block">{m.step}</span>
              <div className="font-semibold text-slate-200">{m.title}</div>
              <p className="text-[11px] text-slate-400 leading-snug">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Attribution Footer Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div>
            <span className="text-slate-200 font-semibold">Student Candidate: Kali Gupta</span>
            <span className="text-slate-400 ml-2">· B.Sc. Data Science (Sem V)</span>
            <div className="text-slate-400 text-[11px]">D.T.S.S. College of Commerce (Autonomous), University of Mumbai</div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('about')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap cursor-pointer"
        >
          View Full Project Profile →
        </button>
      </div>
    </div>
  );
};
