import React, { useState, useMemo } from 'react';
import { Boxes, PackageCheck, PackageOpen, AlertOctagon, Sliders, Download, CheckCircle, Info, Filter } from 'lucide-react';
import { LibraryRecord, InventoryRecommendation } from '../types';
import { generateInventoryRecommendations, exportToCSV } from '../utils/dataProcessing';

interface InventoryViewProps {
  records: LibraryRecord[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({ records }) => {
  const [threshold, setThreshold] = useState<number>(3);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Recommendations calculation
  const recommendations = useMemo(() => {
    return generateInventoryRecommendations(records, threshold);
  }, [records, threshold]);

  const totalCopies = records.length;
  const availableCopies = records.filter(r => (r.Book_Availability || '').toLowerCase() === 'available').length;
  const issuedCopies = records.filter(r => (r.Book_Availability || '').toLowerCase() === 'issued').length;
  const reservedCopies = totalCopies - availableCopies - issuedCopies;

  const urgentCount = recommendations.filter(r => r.Status === 'Urgent Procurement').length;
  const restockCount = recommendations.filter(r => r.Status === 'Restock Alert').length;
  const excessCount = recommendations.filter(r => r.Status === 'Excess Shelf Stock').length;
  const normalCount = recommendations.filter(r => r.Status === 'Adequate Stock').length;

  // Filtered by status
  const displayedRecs = useMemo(() => {
    if (statusFilter === 'All') return recommendations;
    return recommendations.filter(r => r.Status === statusFilter);
  }, [recommendations, statusFilter]);

  const handleExportCSV = () => {
    const exportRows = recommendations.map(r => ({
      Book_ID: r.Book_ID,
      Book_Title: r.Book_Title,
      Category: r.Category,
      Borrow_Count: r.Borrow_Count,
      Available_Copies: r.Available_Copies,
      Issued_Copies: r.Issued_Copies,
      Action_Status: r.Status,
      Recommendation: r.Recommendation,
      Statistical_Justification: r.Justification,
    }));
    exportToCSV(exportRows, 'inventory_procurement_report.csv');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Inventory Analysis & Rule-Based Procurement</h2>
          <p className="text-xs text-slate-400">
            Algorithmic stock replenishment recommendations driven strictly by borrowing velocity vs. shelf availability (Non-AI)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer shadow-md shadow-indigo-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export Inventory Report CSV</span>
        </button>
      </div>

      {/* Plain English Understanding Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">How the Recommendation Rules Work (Zero AI Hallucination)</span>
          <p className="text-slate-400 leading-relaxed">
            The system compares each book&apos;s <strong>borrowing velocity</strong> (lifetime checkouts) against its <strong>current shelf availability</strong>.
            If borrowing velocity is in the top 30% and available copies are $\le$ the safety threshold, the system automatically triggers an <strong>Urgent Procurement</strong> directive.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Total Inventory Tracked</span>
            <Boxes className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-100">{totalCopies.toLocaleString()}</span>
          <p className="text-xs text-slate-400 mt-1">Circulation instances</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Available on Shelves</span>
            <PackageCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400">{availableCopies.toLocaleString()}</span>
          <p className="text-xs text-slate-400 mt-1">Ready for checkout</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Currently Issued</span>
            <PackageOpen className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400">{issuedCopies.toLocaleString()}</span>
          <p className="text-xs text-slate-400 mt-1">In active circulation</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Reserved / Processing</span>
            <AlertOctagon className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-sky-400">{reservedCopies.toLocaleString()}</span>
          <p className="text-xs text-slate-400 mt-1">In transit or reserve</p>
        </div>
      </div>

      {/* Threshold Control Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Adjust Low-Stock Safety Threshold</h3>
          </div>
          <p className="text-xs text-slate-400">
            Slide to test different safety buffer levels. Currently triggers alert when shelf copies $\le$ {threshold}.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-72">
          <input
            type="range"
            min="1"
            max="8"
            value={threshold}
            onChange={e => setThreshold(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-bold font-mono text-indigo-400 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
            {threshold} copies
          </span>
        </div>
      </div>

      {/* Rule Status Cards with Click-to-Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'Urgent Procurement' ? 'All' : 'Urgent Procurement')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Urgent Procurement'
              ? 'bg-rose-500/20 border-rose-500 shadow-md shadow-rose-500/10'
              : 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700/60'
          }`}
        >
          <span className="text-xs font-semibold text-rose-400 block uppercase">🚨 Urgent Procurement</span>
          <span className="text-2xl font-bold font-mono text-rose-300">{urgentCount}</span>
          <p className="text-[11px] text-rose-400/80 mt-1">High demand + low stock</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Restock Alert' ? 'All' : 'Restock Alert')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Restock Alert'
              ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/10'
              : 'bg-amber-950/20 border-amber-900/40 hover:border-amber-700/60'
          }`}
        >
          <span className="text-xs font-semibold text-amber-400 block uppercase">⚠️ Restock Alert</span>
          <span className="text-2xl font-bold font-mono text-amber-300">{restockCount}</span>
          <p className="text-[11px] text-amber-400/80 mt-1">Zero shelf copies available</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Excess Shelf Stock' ? 'All' : 'Excess Shelf Stock')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Excess Shelf Stock'
              ? 'bg-sky-500/20 border-sky-500 shadow-md shadow-sky-500/10'
              : 'bg-sky-950/20 border-sky-900/40 hover:border-sky-700/60'
          }`}
        >
          <span className="text-xs font-semibold text-sky-400 block uppercase">📦 Excess Shelf Stock</span>
          <span className="text-2xl font-bold font-mono text-sky-300">{excessCount}</span>
          <p className="text-[11px] text-sky-400/80 mt-1">Low demand + high stock</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Adequate Stock' ? 'All' : 'Adequate Stock')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Adequate Stock'
              ? 'bg-emerald-500/20 border-emerald-500 shadow-md shadow-emerald-500/10'
              : 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-700/60'
          }`}
        >
          <span className="text-xs font-semibold text-emerald-400 block uppercase">✅ Adequate Stock</span>
          <span className="text-2xl font-bold font-mono text-emerald-300">{normalCount}</span>
          <p className="text-[11px] text-emerald-400/80 mt-1">Balanced inventory ratio</p>
        </button>
      </div>

      {/* Recommendations Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-200">Rule-Based Inventory Recommendations Table</h3>
            {statusFilter !== 'All' && (
              <span className="text-xs text-indigo-400 font-mono">({statusFilter})</span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">Showing {displayedRecs.length} Titles</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950/90 sticky top-0 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
              <tr>
                <th className="p-3">Book ID</th>
                <th className="p-3">Book Title</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Lifetime Borrows</th>
                <th className="p-3 text-right">Shelf Available</th>
                <th className="p-3">Action Status</th>
                <th className="p-3">Recommendation Rule</th>
                <th className="p-3">Empirical Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedRecs.map(r => (
                <tr key={r.Book_ID} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono text-indigo-400 whitespace-nowrap">{r.Book_ID}</td>
                  <td className="p-3 font-medium text-slate-200 max-w-xs truncate" title={r.Book_Title}>
                    {r.Book_Title}
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">{r.Category}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-200">{r.Borrow_Count}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">{r.Available_Copies}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        r.Status === 'Urgent Procurement'
                          ? 'text-rose-400'
                          : r.Status === 'Restock Alert'
                          ? 'text-amber-400'
                          : r.Status === 'Excess Shelf Stock'
                          ? 'text-sky-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {r.Status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200 font-medium max-w-xs">{r.Recommendation}</td>
                  <td className="p-3 text-slate-400 text-[11px] max-w-md">{r.Justification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
