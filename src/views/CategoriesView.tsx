import React, { useMemo } from 'react';
import { FolderTree, TrendingUp, Award, Layers, Download } from 'lucide-react';
import { LibraryRecord } from '../types';
import { HorizontalBarChart } from '../components/charts/Charts';
import { exportToCSV } from '../utils/dataProcessing';

interface CategoriesViewProps {
  records: LibraryRecord[];
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ records }) => {
  // Category Aggregation
  const categoryStats = useMemo(() => {
    const map = new Map<string, {
      category: string;
      borrowCount: number;
      uniqueBooks: Set<string>;
      availableCount: number;
      issuedCount: number;
      totalFine: number;
    }>();

    records.forEach(r => {
      const cat = r.Category || 'General';
      const existing = map.get(cat);
      const isAvail = (r.Book_Availability || '').toLowerCase() === 'available';
      const isIssued = (r.Book_Availability || '').toLowerCase() === 'issued';
      const fine = r.Fine_Amount || 0;

      if (existing) {
        existing.borrowCount++;
        existing.uniqueBooks.add(r.Book_ID);
        if (isAvail) existing.availableCount++;
        if (isIssued) existing.issuedCount++;
        existing.totalFine += fine;
      } else {
        map.set(cat, {
          category: cat,
          borrowCount: 1,
          uniqueBooks: new Set([r.Book_ID]),
          availableCount: isAvail ? 1 : 0,
          issuedCount: isIssued ? 1 : 0,
          totalFine: fine,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.borrowCount - a.borrowCount);
  }, [records]);

  const totalCategories = categoryStats.length;
  const mostPopular = categoryStats[0];
  const lowestPopular = categoryStats[categoryStats.length - 1];
  const avgPerCat = totalCategories > 0 ? Math.round(records.length / totalCategories) : 0;

  // Cross-tabulation matrix: Course vs Category
  const crossTabMatrix = useMemo(() => {
    const courses = Array.from(new Set(records.map(r => r.Course || 'General'))).sort();
    const categories = Array.from(new Set(records.map(r => r.Category || 'General'))).sort();

    const counts: Record<string, Record<string, number>> = {};
    courses.forEach(c => {
      counts[c] = {};
      categories.forEach(cat => {
        counts[c][cat] = 0;
      });
    });

    records.forEach(r => {
      const c = r.Course || 'General';
      const cat = r.Category || 'General';
      if (counts[c] && counts[c][cat] !== undefined) {
        counts[c][cat]++;
      }
    });

    return { courses, categories, counts };
  }, [records]);

  const chartData = useMemo(() => {
    return categoryStats.map(c => ({
      label: c.category,
      value: c.borrowCount,
      secondary: `${c.uniqueBooks.size} titles`,
    }));
  }, [categoryStats]);

  const handleExportCSV = () => {
    const exportRows = categoryStats.map(c => ({
      Category: c.category,
      Total_Borrowings: c.borrowCount,
      Unique_Titles: c.uniqueBooks.size,
      Available_Stock: c.availableCount,
      Checked_Out: c.issuedCount,
      Total_Fines: c.totalFine,
    }));
    exportToCSV(exportRows, 'category_analysis_report.csv');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Category & Subject Domain Analysis</h2>
          <p className="text-xs text-slate-400">
            Disciplinary reading preferences, collection breadth, and cross-departmental subject affinity
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Category Analysis CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Total Categories</span>
            <FolderTree className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-100">{totalCategories}</span>
          <p className="text-xs text-slate-400 mt-1">Academic disciplines</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Most Popular Subject</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400 truncate block" title={mostPopular?.category}>
            {mostPopular?.category || 'N/A'}
          </span>
          <p className="text-xs text-slate-400 mt-1">{mostPopular?.borrowCount || 0} total borrowings</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Lowest Circulation</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400 truncate block" title={lowestPopular?.category}>
            {lowestPopular?.category || 'N/A'}
          </span>
          <p className="text-xs text-slate-400 mt-1">{lowestPopular?.borrowCount || 0} total borrowings</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Avg Borrows / Domain</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-sky-400">{avgPerCat}</span>
          <p className="text-xs text-slate-400 mt-1">Mean subject checkouts</p>
        </div>
      </div>

      {/* Category Chart */}
      <HorizontalBarChart
        data={chartData}
        title="Category-wise Circulation Distribution"
        color="#10b981"
        maxItems={10}
      />

      {/* Cross-Tabulation Matrix: Course vs Category */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Cross-Tabulation Matrix: Course vs. Book Category</h3>
            <p className="text-xs text-slate-400">Interaction matrix mapping student major programs to borrowed literature domains</p>
          </div>
          <span className="text-xs font-mono text-indigo-400">Contingency Grid</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
              <tr>
                <th className="p-3 sticky left-0 bg-slate-950">Academic Program</th>
                {crossTabMatrix.categories.map(cat => (
                  <th key={cat} className="p-3 text-center whitespace-nowrap">
                    {cat}
                  </th>
                ))}
                <th className="p-3 text-right bg-slate-950/80">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {crossTabMatrix.courses.map(course => {
                let rowSum = 0;
                return (
                  <tr key={course} className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-200 sticky left-0 bg-slate-900/80 whitespace-nowrap">
                      {course}
                    </td>
                    {crossTabMatrix.categories.map(cat => {
                      const val = crossTabMatrix.counts[course][cat] || 0;
                      rowSum += val;
                      return (
                        <td key={cat} className="p-3 text-center">
                          <span
                            className={`px-2 py-1 rounded ${
                              val > 15
                                ? 'bg-indigo-600/40 text-indigo-200 font-bold'
                                : val > 5
                                ? 'bg-indigo-950/40 text-indigo-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {val}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-3 text-right font-bold text-indigo-400">{rowSum}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
