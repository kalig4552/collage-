import React, { useMemo, useState } from 'react';
import { BookOpen, Library, ArrowUpRight, Award, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { LibraryRecord } from '../types';
import { HorizontalBarChart } from '../components/charts/Charts';
import { exportToCSV } from '../utils/dataProcessing';

interface BooksViewProps {
  records: LibraryRecord[];
}

export const BooksView: React.FC<BooksViewProps> = ({ records }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Book level aggregation
  const bookAggregation = useMemo(() => {
    const map = new Map<string, {
      bookId: string;
      title: string;
      author: string;
      category: string;
      publisher: string;
      pubYear: number;
      borrowCount: number;
      availableCount: number;
      issuedCount: number;
      overdueCount: number;
      availability: string;
    }>();

    records.forEach(r => {
      const existing = map.get(r.Book_ID);
      const isAvail = (r.Book_Availability || '').toLowerCase() === 'available';
      const isIssued = (r.Book_Availability || '').toLowerCase() === 'issued';
      const isOverdue = r.Is_Overdue;

      if (existing) {
        existing.borrowCount++;
        if (isAvail) existing.availableCount++;
        if (isIssued) existing.issuedCount++;
        if (isOverdue) existing.overdueCount++;
        existing.availability = isAvail ? 'Available' : 'Issued';
      } else {
        map.set(r.Book_ID, {
          bookId: r.Book_ID,
          title: r.Book_Title,
          author: r.Author,
          category: r.Category,
          publisher: r.Publisher,
          pubYear: r.Publication_Year,
          borrowCount: 1,
          availableCount: isAvail ? 1 : 0,
          issuedCount: isIssued ? 1 : 0,
          overdueCount: isOverdue ? 1 : 0,
          availability: r.Book_Availability,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.borrowCount - a.borrowCount);
  }, [records]);

  // Overall KPIs
  const totalBooks = bookAggregation.length;
  const totalAvailable = bookAggregation.reduce((acc, b) => acc + b.availableCount, 0);
  const totalIssued = bookAggregation.reduce((acc, b) => acc + b.issuedCount, 0);
  const mostBorrowed = bookAggregation[0];

  // Top 10 Chart data
  const topBooksChartData = useMemo(() => {
    return bookAggregation.slice(0, 10).map(b => ({
      label: b.title,
      value: b.borrowCount,
      secondary: b.category,
    }));
  }, [bookAggregation]);

  // Filtered rows
  const filteredBooks = useMemo(() => {
    if (!search.trim()) return bookAggregation;
    const q = search.toLowerCase();
    return bookAggregation.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.bookId.toLowerCase().includes(q)
    );
  }, [bookAggregation, search]);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  const handleExportCSV = () => {
    const exportRows = bookAggregation.map(b => ({
      Book_ID: b.bookId,
      Book_Title: b.title,
      Author: b.author,
      Category: b.category,
      Publisher: b.publisher,
      Publication_Year: b.pubYear,
      Borrow_Count: b.borrowCount,
      Available_Copies: b.availableCount,
      Issued_Copies: b.issuedCount,
      Availability_Status: b.availability,
    }));
    exportToCSV(exportRows, 'book_analysis_report.csv');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Books & Catalogue Circulation Analysis</h2>
          <p className="text-xs text-slate-400">
            Circulation depth per monograph title, shelf availability tracking, and author popularity
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer shadow-md shadow-indigo-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export Book Analysis CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Unique Titles</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-100">{totalBooks}</span>
          <p className="text-xs text-slate-400 mt-1">Distinct catalogue entries</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Available Copies</span>
            <Library className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400">{totalAvailable}</span>
          <p className="text-xs text-slate-400 mt-1">Ready for circulation</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Issued Copies</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400">{totalIssued}</span>
          <p className="text-xs text-slate-400 mt-1">Currently checked out</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Top Title Velocity</span>
            <Award className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-rose-400">{mostBorrowed?.borrowCount || 0}</span>
          <p className="text-xs text-slate-400 mt-1 truncate" title={mostBorrowed?.title}>
            {mostBorrowed?.title || 'N/A'}
          </p>
        </div>
      </div>

      {/* Top 10 Chart */}
      <HorizontalBarChart
        data={topBooksChartData}
        title="Top 10 Most Borrowed Books"
        color="#6366f1"
        maxItems={10}
      />

      {/* Catalogue & Circulation Roster */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-200">Book-Level Circulation & Availability Table</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter book or author..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
              <tr>
                <th className="p-3">Book ID</th>
                <th className="p-3">Book Title</th>
                <th className="p-3">Author</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Borrow Count</th>
                <th className="p-3 text-right">Available Copies</th>
                <th className="p-3 text-right">Issued Copies</th>
                <th className="p-3">Shelf Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedBooks.map(b => (
                <tr key={b.bookId} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono text-indigo-400 whitespace-nowrap">{b.bookId}</td>
                  <td className="p-3 font-medium text-slate-200 max-w-sm truncate" title={b.title}>
                    {b.title}
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">{b.author}</td>
                  <td className="p-3 text-slate-300 whitespace-nowrap">{b.category}</td>
                  <td className="p-3 text-right font-mono font-semibold text-indigo-300">{b.borrowCount}</td>
                  <td className="p-3 text-right font-mono text-emerald-400">{b.availableCount}</td>
                  <td className="p-3 text-right font-mono text-amber-400">{b.issuedCount}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        b.availableCount > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {b.availableCount > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing{' '}
            <span className="font-mono text-slate-200 font-semibold">
              {Math.min((currentPage - 1) * pageSize + 1, filteredBooks.length)}
            </span>{' '}
            to{' '}
            <span className="font-mono text-slate-200 font-semibold">
              {Math.min(currentPage * pageSize, filteredBooks.length)}
            </span>{' '}
            of <span className="font-mono text-slate-200 font-semibold">{filteredBooks.length}</span> titles
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
