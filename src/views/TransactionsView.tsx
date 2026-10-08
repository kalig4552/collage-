import React, { useMemo } from 'react';
import { ArrowLeftRight, CheckCircle2, Clock, Calendar, BarChart3 } from 'lucide-react';
import { LibraryRecord } from '../types';
import { LineTrendChart, HorizontalBarChart } from '../components/charts/Charts';

interface TransactionsViewProps {
  records: LibraryRecord[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ records }) => {
  const totalIssues = records.length;
  const totalReturns = records.filter(r => r.Transaction_Status === 'Returned').length;
  const pendingReturns = totalIssues - totalReturns;
  const avgLoanDays = useMemo(() => {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, r) => acc + (r.Loan_Days || 14), 0);
    return Math.round((sum / records.length) * 10) / 10;
  }, [records]);

  // Monthly Issues vs Returns
  const monthlyComparison = useMemo(() => {
    const issuesMap: Record<string, number> = {};
    const returnsMap: Record<string, number> = {};

    records.forEach(r => {
      if (r.Year_Month && r.Year_Month !== 'Unknown') {
        issuesMap[r.Year_Month] = (issuesMap[r.Year_Month] || 0) + 1;
        if (r.Transaction_Status === 'Returned') {
          returnsMap[r.Year_Month] = (returnsMap[r.Year_Month] || 0) + 1;
        }
      }
    });

    const months = Array.from(new Set([...Object.keys(issuesMap), ...Object.keys(returnsMap)])).sort();
    return months.map(m => {
      const parts = m.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return {
        month: `${monthNames[mIdx]} '${parts[0].slice(2)}`,
        issues: issuesMap[m] || 0,
        returns: returnsMap[m] || 0,
      };
    });
  }, [records]);

  // Loan Duration Bins
  const loanBins = useMemo(() => {
    const bins = [
      { label: '≤ 7 Days (Expedited)', count: 0 },
      { label: '8 – 14 Days (On Schedule)', count: 0 },
      { label: '15 – 21 Days (Slight Delay)', count: 0 },
      { label: '22 – 30 Days (Extended Loan)', count: 0 },
      { label: '30+ Days (Severe Overdue)', count: 0 },
    ];

    records.forEach(r => {
      const d = r.Loan_Days || 14;
      if (d <= 7) bins[0].count++;
      else if (d <= 14) bins[1].count++;
      else if (d <= 21) bins[2].count++;
      else if (d <= 30) bins[3].count++;
      else bins[4].count++;
    });

    return bins.map(b => ({
      label: b.label,
      value: b.count,
    }));
  }, [records]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Issue & Return Circulation Dynamics</h2>
        <p className="text-xs text-slate-400">
          Circulation velocity, loan duration adherence, and return completion rate tracking
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Total Issues</span>
            <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-100">{totalIssues.toLocaleString()}</span>
          <p className="text-xs text-slate-400 mt-1">Total circulation events</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Confirmed Returns</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400">{totalReturns.toLocaleString()}</span>
          <p className="text-xs text-slate-400 mt-1">
            {totalIssues > 0 ? `${Math.round((totalReturns / totalIssues) * 100)}% return rate` : '0%'}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Active / Pending Loans</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400">{pendingReturns.toLocaleString()}</span>
          <p className="text-xs text-slate-400 mt-1">Currently circulating</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Avg Loan Duration</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-sky-400">{avgLoanDays} days</span>
          <p className="text-xs text-slate-400 mt-1">Policy baseline: 14 days</p>
        </div>
      </div>

      {/* Monthly Issues vs Returns Comparison Table & Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Monthly Circulation Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-2">Month</th>
                  <th className="p-2 text-right">Issues</th>
                  <th className="p-2 text-right">Returns</th>
                  <th className="p-2 text-right">Net Circulation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {monthlyComparison.map(m => (
                  <tr key={m.month} className="hover:bg-slate-800/30">
                    <td className="p-2 font-medium text-slate-300">{m.month}</td>
                    <td className="p-2 text-right text-indigo-400">{m.issues}</td>
                    <td className="p-2 text-right text-emerald-400">{m.returns}</td>
                    <td className="p-2 text-right text-slate-300">
                      {m.issues - m.returns > 0 ? `+${m.issues - m.returns}` : m.issues - m.returns}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loan Duration Distribution */}
        <HorizontalBarChart
          data={loanBins}
          title="Loan Duration Frequency Distribution"
          color="#8b5cf6"
          maxItems={5}
        />
      </div>
    </div>
  );
};
