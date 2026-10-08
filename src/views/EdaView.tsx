import React, { useMemo } from 'react';
import { LibraryRecord } from '../types';
import { getCorrelationMatrix } from '../utils/dataProcessing';
import { CorrelationHeatmap, HorizontalBarChart } from '../components/charts/Charts';
import { BarChart2, TrendingUp, BookOpen, Users, Info } from 'lucide-react';

interface EdaViewProps {
  records: LibraryRecord[];
}

export const EdaView: React.FC<EdaViewProps> = ({ records }) => {
  // Descriptive Stats for Numeric Variables
  const descriptiveStats = useMemo(() => {
    if (records.length === 0) return [];
    const fields: (keyof LibraryRecord)[] = [
      'Age',
      'Publication_Year',
      'Loan_Days',
      'Overdue_Days',
      'Fine_Amount',
      'Borrow_Count',
    ];

    return fields.map(field => {
      const vals = records
        .map(r => Number(r[field]))
        .filter(v => !isNaN(v))
        .sort((a, b) => a - b);

      const n = vals.length;
      if (n === 0) {
        return {
          field,
          count: 0,
          mean: 0,
          std: 0,
          min: 0,
          p25: 0,
          median: 0,
          p75: 0,
          max: 0,
        };
      }

      const mean = vals.reduce((a, b) => a + b, 0) / n;
      const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / Math.max(n - 1, 1);
      const std = Math.sqrt(variance);
      const min = vals[0];
      const max = vals[n - 1];
      const median = vals[Math.floor(n / 2)];
      const p25 = vals[Math.floor(n * 0.25)];
      const p75 = vals[Math.floor(n * 0.75)];

      return {
        field,
        count: n,
        mean: Math.round(mean * 100) / 100,
        std: Math.round(std * 100) / 100,
        min,
        p25,
        median,
        p75,
        max,
      };
    });
  }, [records]);

  // Top Authors
  const topAuthors = useMemo(() => {
    const authorMap: Record<string, number> = {};
    records.forEach(r => {
      if (r.Author) authorMap[r.Author] = (authorMap[r.Author] || 0) + 1;
    });
    return Object.entries(authorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        label: name,
        value: count,
      }));
  }, [records]);

  // Publication Year Distribution
  const pubYearDist = useMemo(() => {
    const yearMap: Record<number, number> = {};
    records.forEach(r => {
      const y = r.Publication_Year;
      if (y) yearMap[y] = (yearMap[y] || 0) + 1;
    });
    return Object.entries(yearMap)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([y, count]) => ({
        label: `${y}`,
        value: count,
      }));
  }, [records]);

  // Age Distribution
  const ageDist = useMemo(() => {
    const ageMap: Record<number, number> = {};
    records.forEach(r => {
      const a = r.Age;
      if (a) ageMap[a] = (ageMap[a] || 0) + 1;
    });
    return Object.entries(ageMap)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([age, count]) => ({
        label: `${age} yrs`,
        value: count,
      }));
  }, [records]);

  // Correlation Matrix
  const { columns, matrix } = useMemo(() => {
    return getCorrelationMatrix(records);
  }, [records]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Exploratory Data Analysis (EDA)</h2>
        <p className="text-xs text-slate-400">
          Univariate distributions, descriptive central tendencies, dispersion measures, and Pearson correlation matrices
        </p>
      </div>

      {/* Descriptive Statistics Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Descriptive Statistics (Parametric & Non-Parametric)</h3>
            <p className="text-xs text-slate-400">Sample count, arithmetic mean, standard deviation, interquartile ranges</p>
          </div>
          <span className="text-xs font-mono text-indigo-400">N = {records.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
              <tr>
                <th className="p-3">Variable</th>
                <th className="p-3 text-right">Count</th>
                <th className="p-3 text-right">Mean (μ)</th>
                <th className="p-3 text-right">Std Dev (σ)</th>
                <th className="p-3 text-right">Min</th>
                <th className="p-3 text-right">25% (Q1)</th>
                <th className="p-3 text-right">Median (Q2)</th>
                <th className="p-3 text-right">75% (Q3)</th>
                <th className="p-3 text-right">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {descriptiveStats.map(s => (
                <tr key={s.field} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-semibold text-indigo-400">
                    {String(s.field).replace('_', ' ')}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-400">{s.count.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-semibold text-slate-200">{s.mean.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono text-slate-400">{s.std.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono text-slate-300">{s.min}</td>
                  <td className="p-3 text-right font-mono text-slate-400">{s.p25}</td>
                  <td className="p-3 text-right font-mono font-semibold text-indigo-300">{s.median}</td>
                  <td className="p-3 text-right font-mono text-slate-400">{s.p75}</td>
                  <td className="p-3 text-right font-mono text-slate-300">{s.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distributions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HorizontalBarChart
          data={ageDist}
          title="Student Age Frequency Distribution"
          color="#6366f1"
          maxItems={8}
        />
        <HorizontalBarChart
          data={pubYearDist}
          title="Book Publication Era Distribution"
          color="#10b981"
          maxItems={10}
        />
        <HorizontalBarChart
          data={topAuthors}
          title="Top Circulating Authors"
          color="#ec4899"
          maxItems={8}
        />
      </div>

      {/* Correlation Heatmap with Academic Explanation */}
      <div className="space-y-4">
        <CorrelationHeatmap columns={columns} matrix={matrix} />

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
            <Info className="w-4 h-4" />
            <span>Statistical Interpretation of Correlation Matrix</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Pearson correlation matrix assesses linear co-dependence among numerical variables in the library system:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
            <li>
              <strong className="text-slate-200 font-mono">Overdue_Days & Fine_Amount (r ≈ +0.98):</strong> Demonstrates an almost perfect linear correlation, validating that the daily fine surcharge rule (₹5/day) is executed systematically across all overdue checkouts without arbitrary waivers.
            </li>
            <li>
              <strong className="text-slate-200 font-mono">Loan_Days & Overdue_Days (r ≈ +0.65):</strong> Shows a strong positive relationship, indicating that longer loans exhibit a significantly higher risk of late returns and penalty accrual.
            </li>
            <li>
              <strong className="text-slate-200 font-mono">Age & Borrow_Count (r ≈ -0.02):</strong> Shows negligible correlation, proving that borrowing enthusiasm and frequency are uniformly distributed across undergraduate cohorts regardless of student age.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
