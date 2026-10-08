import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  Database,
  Sparkles,
  BarChart3,
  BookMarked,
  Users,
  FolderTree,
  ArrowLeftRight,
  AlertTriangle,
  Boxes,
  FileSpreadsheet,
  Info,
  RotateCcw,
  Code2,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { PageSection, FilterState } from '../types';

interface SidebarProps {
  currentSection: PageSection;
  onNavigate: (section: PageSection) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableCourses: string[];
  availableYears: string[];
  availableGenders: string[];
  availableCategories: string[];
  availableStatuses: string[];
  totalFiltered: number;
  totalRecords: number;
  overdueCount?: number;
  issuedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  filters,
  onFilterChange,
  availableCourses,
  availableYears,
  availableGenders,
  availableCategories,
  availableStatuses,
  totalFiltered,
  totalRecords,
  overdueCount = 0,
  issuedCount = 0,
}) => {
  const [sidebarTab, setSidebarTab] = useState<'menu' | 'filters'>('menu');

  const navigationGroups = [
    {
      group: 'Overview',
      items: [
        { id: 'home' as PageSection, label: 'Home', desc: 'Project overview & brief', icon: Home },
        { id: 'dashboard' as PageSection, label: 'Executive Dashboard', desc: 'Core KPIs & 8 charts', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Circulation Analytics',
      items: [
        { id: 'books' as PageSection, label: 'Books Analysis', desc: 'Title demand & availability', icon: BookMarked },
        { id: 'students' as PageSection, label: 'Student Patrons', desc: 'Active student leaderboard', icon: Users },
        { id: 'categories' as PageSection, label: 'Categories & Courses', desc: 'Subject affinity matrix', icon: FolderTree },
        { id: 'transactions' as PageSection, label: 'Issue & Returns', desc: 'Circulation velocity', icon: ArrowLeftRight, badge: issuedCount > 0 ? `${issuedCount}` : undefined, badgeColor: 'bg-sky-500/20 text-sky-300' },
        { id: 'overdue' as PageSection, label: 'Overdue & Fines', desc: 'Defaulters & penalty ledger', icon: AlertTriangle, badge: overdueCount > 0 ? `${overdueCount}` : undefined, badgeColor: 'bg-rose-500/20 text-rose-300' },
        { id: 'inventory' as PageSection, label: 'Inventory & Stock', desc: 'Rule-based purchasing', icon: Boxes },
      ],
    },
    {
      group: 'Data Engineering',
      items: [
        { id: 'dataset' as PageSection, label: 'Dataset & Search', desc: 'Upload CSV & inspection', icon: Database },
        { id: 'cleaning' as PageSection, label: 'Data Cleaning', desc: 'Hygiene & transformations', icon: Sparkles },
        { id: 'eda' as PageSection, label: 'EDA & Statistics', desc: 'Distributions & correlation', icon: BarChart3 },
      ],
    },
    {
      group: 'Project Deliverables',
      items: [
        { id: 'reports' as PageSection, label: 'Reports & CSV Hub', desc: '10-section formal report', icon: FileSpreadsheet },
        { id: 'about' as PageSection, label: 'About & Methodology', desc: 'Academic viva specifications', icon: Info },
        { id: 'python-project' as PageSection, label: 'Python Source & ZIP', desc: 'Download Streamlit app', icon: Code2 },
      ],
    },
  ];

  const handleResetFilters = () => {
    onFilterChange({
      dateRange: { start: '', end: '' },
      course: 'All',
      year: 'All',
      gender: 'All',
      category: 'All',
      bookTitle: 'All',
      transactionStatus: 'All',
      searchQuery: '',
    });
  };

  const isFiltered =
    filters.course !== 'All' ||
    filters.year !== 'All' ||
    filters.gender !== 'All' ||
    filters.category !== 'All' ||
    filters.transactionStatus !== 'All' ||
    filters.searchQuery !== '';

  return (
    <aside className="w-full lg:w-72 bg-slate-950/80 border-r border-slate-800/80 p-4 flex flex-col gap-4 flex-shrink-0">
      {/* Top Segmented Tab Switcher: Menu vs Filters */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => setSidebarTab('menu')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            sidebarTab === 'menu'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Modules</span>
        </button>

        <button
          onClick={() => setSidebarTab('filters')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
            sidebarTab === 'filters'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute right-2.5 top-2" />
          )}
        </button>
      </div>

      {/* Showing Record Counter Pill */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
        <span className="text-slate-400">Filtered Records</span>
        <div className="font-mono font-bold">
          <span className="text-indigo-400">{totalFiltered.toLocaleString()}</span>
          <span className="text-slate-400 font-normal"> / {totalRecords.toLocaleString()}</span>
        </div>
      </div>

      {/* Tab: Menu */}
      {sidebarTab === 'menu' && (
        <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
          {navigationGroups.map(grp => (
            <div key={grp.group} className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2.5 mb-1">
                {grp.group}
              </span>
              <nav className="space-y-1">
                {grp.items.map(item => {
                  const Icon = item.icon;
                  const active = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                        <div className="truncate">
                          <div className="truncate leading-snug">{item.label}</div>
                          <div className={`text-[10px] truncate ${active ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Filters */}
      {sidebarTab === 'filters' && (
        <div className="space-y-3.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-slate-300">Active Criteria</span>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Quick Presets</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onFilterChange({ ...filters, transactionStatus: 'Overdue' })}
                className={`p-2 rounded-lg text-[11px] font-medium text-left border transition-colors cursor-pointer ${
                  filters.transactionStatus === 'Overdue'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                🚨 Overdue Only
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, transactionStatus: 'Issued' })}
                className={`p-2 rounded-lg text-[11px] font-medium text-left border transition-colors cursor-pointer ${
                  filters.transactionStatus === 'Issued'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ⏱️ Active Loans
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, course: 'B.Sc. Data Science' })}
                className={`p-2 rounded-lg text-[11px] font-medium text-left border transition-colors cursor-pointer ${
                  filters.course === 'B.Sc. Data Science'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                📊 Data Science
              </button>
              <button
                onClick={handleResetFilters}
                className="p-2 rounded-lg text-[11px] font-medium text-left bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                🔄 Show All
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-3 space-y-3">
            {/* Filter: Course */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Academic Course</label>
              <select
                value={filters.course}
                onChange={e => onFilterChange({ ...filters, course: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Courses</option>
                {availableCourses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter: Year */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Academic Year</label>
              <select
                value={filters.year}
                onChange={e => onFilterChange({ ...filters, year: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Years</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Filter: Category */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Subject Category</label>
              <select
                value={filters.category}
                onChange={e => onFilterChange({ ...filters, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filter: Status */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Transaction Status</label>
              <select
                value={filters.transactionStatus}
                onChange={e => onFilterChange({ ...filters, transactionStatus: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Statuses</option>
                {availableStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Filter: Gender */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Student Gender</label>
              <select
                value={filters.gender}
                onChange={e => onFilterChange({ ...filters, gender: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Genders</option>
                {availableGenders.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
