import React, { useMemo, useState } from 'react';
import { AlertTriangle, Users, IndianRupee, Clock, ArrowDownWideNarrow, Download, Search, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { LibraryRecord } from '../types';
import { exportToCSV } from '../utils/dataProcessing';

interface OverdueViewProps {
  records: LibraryRecord[];
}

export const OverdueView: React.FC<OverdueViewProps> = ({ records }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Filter overdue records
  const overdueRecords = useMemo(() => {
    return records
      .filter(r => r.Is_Overdue || r.Transaction_Status === 'Overdue' || (r.Fine_Amount && r.Fine_Amount > 0))
      .sort((a, b) => (b.Overdue_Days || 0) - (a.Overdue_Days || 0));
  }, [records]);

  // KPIs
  const totalOverdueBooks = overdueRecords.length;
  const overdueStudents = new Set(overdueRecords.map(r => r.Student_ID)).size;
  const totalFine = overdueRecords.reduce((acc, r) => acc + (r.Fine_Amount || 0), 0);
  const avgFine = totalOverdueBooks > 0 ? (totalFine / totalOverdueBooks).toFixed(2) : '0.00';
  const maxFine = overdueRecords.reduce((max, r) => Math.max(max, r.Fine_Amount || 0), 0);

  // Search filter
  const displayedRecords = useMemo(() => {
    if (!search.trim()) return overdueRecords;
    const q = search.toLowerCase();
    return overdueRecords.filter(
      r =>
        r.Student_Name.toLowerCase().includes(q) ||
        r.Student_ID.toLowerCase().includes(q) ||
        r.Book_Title.toLowerCase().includes(q) ||
        r.Book_ID.toLowerCase().includes(q)
    );
  }, [overdueRecords, search]);

  // Pagination
  const totalPages = Math.ceil(displayedRecords.length / pageSize) || 1;
  const paginatedOverdue = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedRecords.slice(start, start + pageSize);
  }, [displayedRecords, currentPage, pageSize]);

  const handleExportCSV = () => {
    const exportRows = overdueRecords.map(r => ({
      Student_ID: r.Student_ID,
      Student_Name: r.Student_Name,
      Book_ID: r.Book_ID,
      Book_Title: r.Book_Title,
      Issue_Date: r.Issue_Date,
      Due_Date: r.Due_Date,
      Return_Date: r.Return_Date || 'Pending Return',
      Days_Overdue: r.Overdue_Days,
      Fine_Amount: r.Fine_Amount,
    }));
    exportToCSV(exportRows, 'overdue_report.csv');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Overdue Analysis & Fine Recovery</h2>
          <p className="text-xs text-slate-400">
            Defaulter rosters, overdue duration severity tiers, and penalty collection audit trails
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer shadow-md shadow-rose-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export Overdue Defaulters CSV</span>
        </button>
      </div>

      {/* Plain English Understanding Banner */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-rose-300">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-rose-200">How Overdue is Calculated in this Library</span>
            <p className="text-rose-300/80 leading-relaxed">
              Standard loan duration is <strong>14 days</strong>. Books returned or kept beyond the statutory due date incur a penalty fine of <strong>₹5.00 per day</strong>. Defaulters with more than 14 days overdue are flagged for administrative recalls.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 font-mono text-rose-200 bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-900/60">
          <span>Rate: ₹5.00 / day</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Overdue Loans</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-rose-400">{totalOverdueBooks}</span>
          <p className="text-xs text-slate-400 mt-1">Pending past due date</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Defaulter Students</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400">{overdueStudents}</span>
          <p className="text-xs text-slate-400 mt-1">Distinct delinquent patrons</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Total Accrued Fine</span>
            <IndianRupee className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-rose-400">₹{totalFine.toFixed(2)}</span>
          <p className="text-xs text-slate-400 mt-1">Cumulative penalty fees</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Avg Fine / Loan</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-sky-400">₹{avgFine}</span>
          <p className="text-xs text-slate-400 mt-1">Per overdue transaction</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Max Penalty</span>
            <ArrowDownWideNarrow className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-violet-400">₹{maxFine.toFixed(2)}</span>
          <p className="text-xs text-slate-400 mt-1">Peak single violation</p>
        </div>
      </div>

      {/* Overdue Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Overdue Defaulters Roster</h3>
            <p className="text-xs text-slate-400">Sorted in descending order by days overdue</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search student or book title..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
              <tr>
                <th className="p-3">Student ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Book ID</th>
                <th className="p-3">Book Title</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Days Overdue</th>
                <th className="p-3 text-right">Fine Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedOverdue.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No overdue transactions found.
                  </td>
                </tr>
              ) : (
                paginatedOverdue.map(r => {
                  const days = r.Overdue_Days || 0;
                  const severityBadge =
                    days > 20
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : days > 7
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';

                  return (
                    <tr key={r.Transaction_ID} className="hover:bg-slate-800/30">
                      <td className="p-3 text-indigo-400 font-bold">{r.Student_ID}</td>
                      <td className="p-3 font-sans font-medium text-slate-200">{r.Student_Name}</td>
                      <td className="p-3 text-slate-400">{r.Book_ID}</td>
                      <td className="p-3 font-sans font-medium text-slate-300 max-w-xs truncate" title={r.Book_Title}>
                        {r.Book_Title}
                      </td>
                      <td className="p-3 text-slate-400">{r.Issue_Date}</td>
                      <td className="p-3 text-slate-400">{r.Due_Date}</td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${severityBadge}`}>
                          {days > 20 ? 'Critical' : days > 7 ? 'Urgent' : 'Notice'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-rose-400">
                        {r.Overdue_Days} days
                      </td>
                      <td className="p-3 text-right font-bold text-amber-400">
                        ₹{(r.Fine_Amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing{' '}
            <span className="font-mono text-slate-200 font-semibold">
              {Math.min((currentPage - 1) * pageSize + 1, displayedRecords.length)}
            </span>{' '}
            to{' '}
            <span className="font-mono text-slate-200 font-semibold">
              {Math.min(currentPage * pageSize, displayedRecords.length)}
            </span>{' '}
            of <span className="font-mono text-slate-200 font-semibold">{displayedRecords.length}</span> overdue records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            <span className="font-mono text-xs px-2 text-slate-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
