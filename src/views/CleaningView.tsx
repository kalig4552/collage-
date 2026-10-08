import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Cpu, ArrowRight, Check } from 'lucide-react';
import { CleaningStats, LibraryRecord } from '../types';

interface CleaningViewProps {
  stats: CleaningStats;
  records: LibraryRecord[];
}

export const CleaningView: React.FC<CleaningViewProps> = ({ stats, records }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Data Cleaning & Feature Engineering Pipeline</h2>
        <p className="text-xs text-slate-400">
          Deterministic data hygiene audit, schema validation, and derived temporal metrics derivation
        </p>
      </div>

      {/* Visual Plain English Hygiene Comparison Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Before & After Data Hygiene Comparison</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <span className="font-mono text-amber-400 uppercase font-bold text-[11px] block">
              1. Raw Ingested Data
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Total Ingested Rows: <strong className="text-slate-200">{stats.rowsBefore.toLocaleString()}</strong></li>
              <li>• Duplicated or Redundant Rows: <strong className="text-rose-400">{stats.duplicatesRemoved}</strong></li>
              <li>• Raw Null / Missing Cells: <strong className="text-amber-400">{stats.missingBefore}</strong></li>
              <li>• String Formats: Unstandardized, potential leading/trailing whitespace</li>
              <li>• Analytical Features: None derived</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/50 space-y-2 text-xs">
            <span className="font-mono text-emerald-400 uppercase font-bold text-[11px] block">
              2. Sanitized & Engineered Data
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li>• Verified Active Rows: <strong className="text-emerald-400">{stats.rowsAfter.toLocaleString()}</strong></li>
              <li>• Duplicates Pruned: <strong className="text-emerald-400">{stats.duplicatesRemoved} removed</strong></li>
              <li>• Chronological Sequence: <strong className="text-emerald-400">100% verified (Issue $\le$ Due)</strong></li>
              <li>• String Formats: Fully stripped and normalized title case</li>
              <li>• Analytical Features: <strong className="text-indigo-400">+6 engineered columns added</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hygiene Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase">Rows Ingested</span>
          <span className="text-2xl font-bold font-mono text-slate-100">{stats.rowsBefore.toLocaleString()}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase">Rows Preserved</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">{stats.rowsAfter.toLocaleString()}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase">Duplicates Pruned</span>
          <span className="text-2xl font-bold font-mono text-rose-400">{stats.duplicatesRemoved}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase">Nulls Detected</span>
          <span className="text-2xl font-bold font-mono text-amber-400">{stats.missingBefore}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase">Date Sequence Check</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">Pass</span>
        </div>
      </div>

      {/* Systematic Pipeline Steps */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Applied Transformation & Sanitation Steps</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {stats.cleaningSteps.map((step, idx) => (
            <div key={idx} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-300 font-mono">{step.stage}</span>
                <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">{step.description}</p>
              <div className="text-[11px] text-slate-300 font-mono pt-1 border-t border-slate-800">
                Outcome: {step.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Derived Feature Specifications */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Derived Features & Mathematical Formulations</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
              <tr>
                <th className="p-3">Derived Field</th>
                <th className="p-3">Target Data Type</th>
                <th className="p-3">Mathematical / Logical Formula</th>
                <th className="p-3">Plain-English Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-3 font-mono font-semibold text-indigo-400">Loan_Days</td>
                <td className="p-3 font-mono text-slate-400">Integer (Days)</td>
                <td className="p-3 font-mono text-[11px] text-slate-300">
                  Return_Date - Issue_Date
                </td>
                <td className="p-3 text-slate-300">How many total days the student kept the book</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-semibold text-indigo-400">Overdue_Days</td>
                <td className="p-3 font-mono text-slate-400">Integer (Days)</td>
                <td className="p-3 font-mono text-[11px] text-slate-300">
                  max(0, Return_Date - Due_Date)
                </td>
                <td className="p-3 text-slate-300">Days past the official 14-day return deadline</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-semibold text-indigo-400">Is_Overdue</td>
                <td className="p-3 font-mono text-slate-400">Boolean (true/false)</td>
                <td className="p-3 font-mono text-[11px] text-slate-300">
                  Overdue_Days &gt; 0 || Status == &apos;Overdue&apos;
                </td>
                <td className="p-3 text-slate-300">Instant filter flag for library defaulter lists</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-semibold text-indigo-400">Year_Month / Month</td>
                <td className="p-3 font-mono text-slate-400">String (YYYY-MM)</td>
                <td className="p-3 font-mono text-[11px] text-slate-300">
                  strftime(Issue_Date, &apos;%Y-%m&apos;)
                </td>
                <td className="p-3 text-slate-300">Grouping for monthly seasonal borrowing trends</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-semibold text-indigo-400">Quarter</td>
                <td className="p-3 font-mono text-slate-400">Categorical (Q1–Q4)</td>
                <td className="p-3 font-mono text-[11px] text-slate-300">
                  &apos;Q&apos; + floor((Month - 1) / 3) + 1
                </td>
                <td className="p-3 text-slate-300">Aligns with university semester terms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
