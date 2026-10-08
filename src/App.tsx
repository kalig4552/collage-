/**
 * Library Analytics - College Library Management Data Analysis
 * B.Sc. Data Science Academic Project - University of Mumbai
 * Student Candidate: Kali Gupta (Semester V)
 * 100% Local-First, API-Free Decision Support System
 */

import React, { useState, useMemo, useEffect } from 'react';
import { PageSection, FilterState, LibraryRecord, CleaningStats } from './types';
import { rawDefaultData } from './data/defaultDataset';
import { cleanAndProcessRecords, calculateKPIs } from './utils/dataProcessing';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Views
import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { DatasetView } from './views/DatasetView';
import { CleaningView } from './views/CleaningView';
import { EdaView } from './views/EdaView';
import { BooksView } from './views/BooksView';
import { StudentsView } from './views/StudentsView';
import { CategoriesView } from './views/CategoriesView';
import { TransactionsView } from './views/TransactionsView';
import { OverdueView } from './views/OverdueView';
import { InventoryView } from './views/InventoryView';
import { ReportsView } from './views/ReportsView';
import { AboutView } from './views/AboutView';
import { PythonProjectView } from './views/PythonProjectView';

export default function App() {
  // Load default dataset into state
  const initialProcessing = useMemo(() => {
    return cleanAndProcessRecords(rawDefaultData);
  }, []);

  const [records, setRecords] = useState<LibraryRecord[]>(initialProcessing.records);
  const [cleaningStats, setCleaningStats] = useState<CleaningStats>(initialProcessing.stats);
  const [currentSection, setCurrentSection] = useState<PageSection>('home');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    course: 'All',
    year: 'All',
    gender: 'All',
    category: 'All',
    bookTitle: 'All',
    transactionStatus: 'All',
    searchQuery: '',
  });

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  // Available filter options
  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.Course) set.add(r.Course);
    });
    return Array.from(set).sort();
  }, [records]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.Year) set.add(r.Year);
    });
    return Array.from(set).sort();
  }, [records]);

  const availableGenders = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.Gender) set.add(r.Gender);
    });
    return Array.from(set).sort();
  }, [records]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.Category) set.add(r.Category);
    });
    return Array.from(set).sort();
  }, [records]);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.Transaction_Status) set.add(r.Transaction_Status);
    });
    return Array.from(set).sort();
  }, [records]);

  // Reactive Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filters.course !== 'All' && r.Course !== filters.course) return false;
      if (filters.year !== 'All' && r.Year !== filters.year) return false;
      if (filters.gender !== 'All' && r.Gender !== filters.gender) return false;
      if (filters.category !== 'All' && r.Category !== filters.category) return false;
      if (filters.transactionStatus !== 'All' && r.Transaction_Status !== filters.transactionStatus) return false;
      return true;
    });
  }, [records, filters]);

  // Dynamic KPIs calculated strictly from active filtered records
  const kpis = useMemo(() => {
    return calculateKPIs(filteredRecords);
  }, [filteredRecords]);

  // Handle custom file upload
  const handleUploadNewData = (newRecords: LibraryRecord[], rawRows: Record<string, any>[]) => {
    const { records: processed, stats } = cleanAndProcessRecords(rawRows);
    setRecords(processed);
    setCleaningStats(stats);
    // Reset filters
    setFilters({
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

  // Reset to default sample dataset
  const handleResetToSample = () => {
    const { records: processed, stats } = cleanAndProcessRecords(rawDefaultData);
    setRecords(processed);
    setCleaningStats(stats);
    setFilters({
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        recordCount={records.length}
        onResetToSample={handleResetToSample}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation & Global Filters Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onNavigate={setCurrentSection}
          filters={filters}
          onFilterChange={setFilters}
          availableCourses={availableCourses}
          availableYears={availableYears}
          availableGenders={availableGenders}
          availableCategories={availableCategories}
          availableStatuses={availableStatuses}
          totalFiltered={filteredRecords.length}
          totalRecords={records.length}
          overdueCount={kpis.overdueBooks}
          issuedCount={kpis.booksIssued}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentSection === 'home' && (
            <HomeView onNavigate={setCurrentSection} recordCount={records.length} />
          )}
          {currentSection === 'dashboard' && (
            <DashboardView records={filteredRecords} kpis={kpis} />
          )}
          {currentSection === 'dataset' && (
            <DatasetView records={records} onUploadNewData={handleUploadNewData} />
          )}
          {currentSection === 'cleaning' && (
            <CleaningView stats={cleaningStats} records={records} />
          )}
          {currentSection === 'eda' && (
            <EdaView records={filteredRecords} />
          )}
          {currentSection === 'books' && (
            <BooksView records={filteredRecords} />
          )}
          {currentSection === 'students' && (
            <StudentsView records={filteredRecords} />
          )}
          {currentSection === 'categories' && (
            <CategoriesView records={filteredRecords} />
          )}
          {currentSection === 'transactions' && (
            <TransactionsView records={filteredRecords} />
          )}
          {currentSection === 'overdue' && (
            <OverdueView records={filteredRecords} />
          )}
          {currentSection === 'inventory' && (
            <InventoryView records={filteredRecords} />
          )}
          {currentSection === 'reports' && (
            <ReportsView records={filteredRecords} kpis={kpis} />
          )}
          {currentSection === 'about' && (
            <AboutView />
          )}
          {currentSection === 'python-project' && (
            <PythonProjectView />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Library Analytics</span>
            <span>·</span>
            <span>College Library Management Data Analysis</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Kali Gupta · B.Sc. Data Science (Sem V) · D.T.S.S. College of Commerce (Autonomous) · University of Mumbai
          </div>
        </div>
      </footer>
    </div>
  );
}
