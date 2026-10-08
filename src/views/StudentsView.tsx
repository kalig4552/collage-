import React, { useMemo, useState } from 'react';
import { Users, UserCheck, TrendingUp, Award, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { LibraryRecord } from '../types';
import { HorizontalBarChart } from '../components/charts/Charts';
import { exportToCSV } from '../utils/dataProcessing';

interface StudentsViewProps {
  records: LibraryRecord[];
}

export const StudentsView: React.FC<StudentsViewProps> = ({ records }) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Student Aggregation
  const studentAggregation = useMemo(() => {
    const map = new Map<string, {
      studentId: string;
      name: string;
      gender: string;
      age: number;
      course: string;
      year: string;
      member: string;
      borrowCount: number;
      totalFine: number;
      overdueCount: number;
    }>();

    records.forEach(r => {
      const existing = map.get(r.Student_ID);
      const fine = r.Fine_Amount || 0;
      const isOverdue = r.Is_Overdue;

      if (existing) {
        existing.borrowCount++;
        existing.totalFine += fine;
        if (isOverdue) existing.overdueCount++;
      } else {
        map.set(r.Student_ID, {
          studentId: r.Student_ID,
          name: r.Student_Name,
          gender: r.Gender,
          age: r.Age,
          course: r.Course,
          year: r.Year,
          member: r.Library_Member,
          borrowCount: 1,
          totalFine: fine,
          overdueCount: isOverdue ? 1 : 0,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.borrowCount - a.borrowCount);
  }, [records]);

  const totalStudents = studentAggregation.length;
  const totalTransactions = records.length;
  const avgBorrowings = totalStudents > 0 ? (totalTransactions / totalStudents).toFixed(2) : '0';
  const highestBorrower = studentAggregation[0];

  // Course breakdown
  const courseCounts = useMemo(() => {
    const map: Record<string, number> = {};
    studentAggregation.forEach(s => {
      map[s.course] = (map[s.course] || 0) + s.borrowCount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([c, count]) => ({
        label: c,
        value: count,
      }));
  }, [studentAggregation]);

  // Filter by search
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return studentAggregation;
    const q = search.toLowerCase();
    return studentAggregation.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)
    );
  }, [studentAggregation, search]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handleExportCSV = () => {
    const exportRows = studentAggregation.map(s => ({
      Student_ID: s.studentId,
      Student_Name: s.name,
      Gender: s.gender,
      Age: s.age,
      Course: s.course,
      Year: s.year,
      Total_Borrowings: s.borrowCount,
      Total_Fine: s.totalFine,
      Overdue_Count: s.overdueCount,
      Library_Member: s.member,
    }));
    exportToCSV(exportRows, 'student_analysis_report.csv');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Student Borrowing & Demographics Analysis</h2>
          <p className="text-xs text-slate-400">
            Student cohort engagement, departmental borrowing intensity, and active patron leaderboards
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer shadow-md shadow-indigo-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export Student Analysis CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Active Students</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-100">{totalStudents}</span>
          <p className="text-xs text-slate-400 mt-1">Unique student borrowers</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Avg Borrowings / Student</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400">{avgBorrowings}</span>
          <p className="text-xs text-slate-400 mt-1">Checkouts per individual</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Top Patron Borrowings</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400">{highestBorrower?.borrowCount || 0}</span>
          <p className="text-xs text-slate-400 mt-1 truncate" title={highestBorrower?.name}>
            {highestBorrower?.name || 'N/A'}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase">Member Registration</span>
            <UserCheck className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-sky-400">
            {totalStudents > 0
              ? `${Math.round(
                  (studentAggregation.filter(s => s.member === 'Yes').length / totalStudents) * 100
                )}%`
              : '100%'}
          </span>
          <p className="text-xs text-slate-400 mt-1">Official library cards</p>
        </div>
      </div>

      {/* Student Patron Table with Search & Pagination */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-200">Active Student Borrowers Leaderboard</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search student or course..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Student ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Course</th>
                <th className="p-3">Cohort Year</th>
                <th className="p-3 text-right">Total Borrowings</th>
                <th className="p-3 text-right">Overdue Loans</th>
                <th className="p-3 text-right">Fine Incurred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedStudents.map((s, idx) => {
                const globalRank = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr key={s.studentId} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold text-indigo-400">#{globalRank}</td>
                    <td className="p-3 font-mono text-slate-300">{s.studentId}</td>
                    <td className="p-3 font-medium text-slate-200">{s.name}</td>
                    <td className="p-3 text-slate-300">{s.course}</td>
                    <td className="p-3 font-mono text-slate-400">{s.year}</td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-300">{s.borrowCount}</td>
                    <td className="p-3 text-right font-mono text-rose-400">{s.overdueCount}</td>
                    <td className="p-3 text-right font-mono text-amber-400">₹{s.totalFine.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing{' '}
            <span className="font-mono text-slate-200 font-semibold">
              {Math.min((currentPage - 1) * pageSize + 1, filteredStudents.length)}
            </span>{' '}
            to{' '}
            <span className="font-mono text-slate-200 font-semibold">
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </span>{' '}
            of <span className="font-mono text-slate-200 font-semibold">{filteredStudents.length}</span> students
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

      {/* Course Usage Chart */}
      <HorizontalBarChart
        data={courseCounts}
        title="Departmental Course Circulation Volume"
        color="#3b82f6"
        maxItems={8}
      />
    </div>
  );
};
