import React from 'react';
import {
  BookOpen,
  Users,
  Layers,
  ArrowUpRight,
  CheckCircle,
  AlertTriangle,
  Library,
  IndianRupee,
  Sparkles,
  Info,
} from 'lucide-react';
import { LibraryRecord, KPIStats } from '../types';
import { MetricCard } from '../components/MetricCard';
import {
  LineTrendChart,
  HorizontalBarChart,
  DonutChart,
} from '../components/charts/Charts';

interface DashboardViewProps {
  records: LibraryRecord[];
  kpis: KPIStats;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ records, kpis }) => {
  // 1. Monthly Borrowing Trend
  const monthlyMap: Record<string, number> = {};
  records.forEach(r => {
    if (r.Year_Month && r.Year_Month !== 'Unknown') {
      monthlyMap[r.Year_Month] = (monthlyMap[r.Year_Month] || 0) + 1;
    }
  });
  const monthlyTrendData = Object.keys(monthlyMap)
    .sort()
    .map(key => {
      const parts = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return {
        label: `${monthNames[mIdx]} '${parts[0].slice(2)}`,
        value: monthlyMap[key],
      };
    });

  // 2. Top 10 Most Borrowed Books
  const bookCounts: Record<string, { count: number; category: string }> = {};
  records.forEach(r => {
    if (!bookCounts[r.Book_Title]) {
      bookCounts[r.Book_Title] = { count: 0, category: r.Category };
    }
    bookCounts[r.Book_Title].count++;
  });
  const topBooksData = Object.entries(bookCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([title, val]) => ({
      label: title,
      value: val.count,
      secondary: val.category,
    }));

  // 3. Popular Book Categories
  const categoryCounts: Record<string, number> = {};
  records.forEach(r => {
    if (r.Category) {
      categoryCounts[r.Category] = (categoryCounts[r.Category] || 0) + 1;
    }
  });
  const categoryData = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({
      label: cat,
      value: count,
    }));

  // 4. Transaction Status Distribution
  const statusCounts: Record<string, number> = {
    Returned: 0,
    Issued: 0,
    Overdue: 0,
  };
  records.forEach(r => {
    const s = r.Transaction_Status || 'Issued';
    if (s === 'Returned') statusCounts.Returned++;
    else if (s === 'Overdue' || r.Is_Overdue) statusCounts.Overdue++;
    else statusCounts.Issued++;
  });
  const statusDonutData = [
    { label: 'Returned (On Time / Settled)', value: statusCounts.Returned, color: '#10b981' },
    { label: 'Issued (Active Loan)', value: statusCounts.Issued, color: '#3b82f6' },
    { label: 'Overdue (Past 14 Days)', value: statusCounts.Overdue, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // 5. Course-wise Library Usage
  const courseCounts: Record<string, number> = {};
  records.forEach(r => {
    if (r.Course) {
      courseCounts[r.Course] = (courseCounts[r.Course] || 0) + 1;
    }
  });
  const courseData = Object.entries(courseCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([course, count]) => ({
      label: course,
      value: count,
    }));

  // 6. Gender-wise Usage
  const genderCounts: Record<string, number> = {};
  records.forEach(r => {
    if (r.Gender) {
      genderCounts[r.Gender] = (genderCounts[r.Gender] || 0) + 1;
    }
  });
  const genderDonutData = [
    { label: 'Male', value: genderCounts.Male || 0, color: '#6366f1' },
    { label: 'Female', value: genderCounts.Female || 0, color: '#ec4899' },
    { label: 'Other', value: genderCounts.Other || 0, color: '#a855f7' },
  ].filter(d => d.value > 0);

  // 7. Academic Year Usage
  const yearCounts: Record<string, number> = {};
  records.forEach(r => {
    if (r.Year) {
      yearCounts[r.Year] = (yearCounts[r.Year] || 0) + 1;
    }
  });
  const yearData = Object.entries(yearCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({
      label: `${year} (Cohort)`,
      value: count,
    }));

  // 8. Fine Distribution (Bins for overdue penalties)
  const fineRanges = [
    { label: '₹0 (No Fine)', count: 0 },
    { label: '₹1 – ₹25 (1-5 Days Late)', count: 0 },
    { label: '₹26 – ₹50 (6-10 Days Late)', count: 0 },
    { label: '₹51 – ₹100 (11-20 Days Late)', count: 0 },
    { label: '₹100+ (Critical Overdue)', count: 0 },
  ];
  records.forEach(r => {
    const f = r.Fine_Amount || 0;
    if (f === 0) fineRanges[0].count++;
    else if (f <= 25) fineRanges[1].count++;
    else if (f <= 50) fineRanges[2].count++;
    else if (f <= 100) fineRanges[3].count++;
    else fineRanges[4].count++;
  });
  const fineDistributionData = fineRanges.map(fr => ({
    label: fr.label,
    value: fr.count,
  }));

  // Key takeaways calculations
  const returnRate = kpis.totalTransactions > 0
    ? Math.round((kpis.booksReturned / kpis.totalTransactions) * 100)
    : 0;
  const topCategoryName = categoryData.length > 0 ? categoryData[0].label : 'General';
  const topBookName = topBooksData.length > 0 ? topBooksData[0].label : 'General';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Description */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Executive Analytics Dashboard</h2>
        <p className="text-xs text-slate-400">
          Real-time circulation metrics and performance indicators computed dynamically from active dataset
        </p>
      </div>

      {/* Plain-English Executive Summary Box (For Easy Understanding!) */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-indigo-900/40 rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold uppercase tracking-wider font-mono">
          <Sparkles className="w-4 h-4" />
          <span>Executive Summary & Key Takeaways</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-200">Circulation Rate: </strong>
              <span className="text-slate-300">
                {returnRate}% of all loans completed and returned ({kpis.booksReturned.toLocaleString()} records).
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-200">Peak Demand: </strong>
              <span className="text-slate-300">
                &ldquo;{topCategoryName}&rdquo; is the most borrowed subject; top title is &ldquo;{topBookName}&rdquo;.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-200">Overdue Recovery: </strong>
              <span className="text-slate-300">
                {kpis.overdueBooks.toLocaleString()} books currently past due with ₹{kpis.totalFine.toFixed(2)} in fines.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Dynamic KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Books"
          value={kpis.totalBooks.toLocaleString()}
          subtext="Unique titles in catalogue"
          icon={BookOpen}
          variant="indigo"
        />
        <MetricCard
          title="Total Students"
          value={kpis.totalStudents.toLocaleString()}
          subtext="Registered student borrowers"
          icon={Users}
          variant="default"
        />
        <MetricCard
          title="Total Transactions"
          value={kpis.totalTransactions.toLocaleString()}
          subtext="All circulation events"
          icon={Layers}
          variant="default"
        />
        <MetricCard
          title="Books Issued"
          value={kpis.booksIssued.toLocaleString()}
          subtext="Currently with students"
          icon={ArrowUpRight}
          variant="warning"
        />
        <MetricCard
          title="Books Returned"
          value={kpis.booksReturned.toLocaleString()}
          subtext="Completed book returns"
          icon={CheckCircle}
          variant="success"
        />
        <MetricCard
          title="Overdue Books"
          value={kpis.overdueBooks.toLocaleString()}
          subtext="Past standard 14-day loan"
          icon={AlertTriangle}
          variant="danger"
        />
        <MetricCard
          title="Available Books"
          value={kpis.availableBooks.toLocaleString()}
          subtext="Ready on library shelves"
          icon={Library}
          variant="default"
        />
        <MetricCard
          title="Total Fine"
          value={`₹${kpis.totalFine.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Accrued overdue penalties"
          icon={IndianRupee}
          variant="danger"
        />
      </div>

      {/* Visualizations Grid */}
      <div className="space-y-6">
        {/* Row 1: Monthly Trend & Top Borrowed Books */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <LineTrendChart
              data={monthlyTrendData}
              title="1. Monthly Borrowing Circulation Trend"
              xLabel="Academic Month"
              yLabel="Transactions"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
              <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>Shows month-by-month checkout volume throughout the academic year.</span>
            </div>
          </div>

          <div className="space-y-2">
            <HorizontalBarChart
              data={topBooksData}
              title="2. Top 10 Most Borrowed Books"
              color="#6366f1"
              maxItems={10}
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
              <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>Ranked catalogue titles by cumulative student checkouts.</span>
            </div>
          </div>
        </div>

        {/* Row 2: Popular Categories & Transaction Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <HorizontalBarChart
              data={categoryData}
              title="3. Popular Book Categories"
              color="#10b981"
              maxItems={8}
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
              <Info className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Distribution of borrowings across different academic disciplines.</span>
            </div>
          </div>

          <div className="space-y-2">
            <DonutChart
              data={statusDonutData}
              title="4. Transaction Status Distribution"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
              <Info className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span>Proportion of loans returned vs. active vs. overdue.</span>
            </div>
          </div>
        </div>

        {/* Row 3: Course-wise Usage & Cohort Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <HorizontalBarChart
              data={courseData}
              title="5. Course-wise Library Usage"
              color="#3b82f6"
              maxItems={8}
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
              <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>Comparison of library borrowing across student degree programs.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <DonutChart
                data={genderDonutData}
                title="6. Gender-wise Usage"
              />
            </div>
            <div className="space-y-2">
              <HorizontalBarChart
                data={yearData}
                title="7. Year-wise Usage (Cohort)"
                color="#f59e0b"
                maxItems={5}
              />
            </div>
          </div>
        </div>

        {/* Row 4: Fine Distribution */}
        <div className="space-y-2">
          <HorizontalBarChart
            data={fineDistributionData}
            title="8. Fine Distribution by Severity Tiers"
            color="#ef4444"
            maxItems={5}
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
            <Info className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span>Groups late returns by fine amount incurred (at ₹5 per overdue day).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
