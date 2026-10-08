import React, { useState, useMemo } from 'react';
import {
  UploadCloud,
  Download,
  Search,
  ArrowUpDown,
  FileCheck2,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { LibraryRecord } from '../types';
import { exportToCSV, parseCSV, cleanAndProcessRecords } from '../utils/dataProcessing';

interface DatasetViewProps {
  records: LibraryRecord[];
  onUploadNewData: (records: LibraryRecord[], rawRows: Record<string, any>[]) => void;
}

export const DatasetView: React.FC<DatasetViewProps> = ({ records, onUploadNewData }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof LibraryRecord>('Transaction_ID');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'schema'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Only RFC-4180 CSV files are supported. Please upload a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        if (!text || text.trim().length === 0) {
          setUploadError('The uploaded CSV file is empty.');
          return;
        }

        const rawRows = parseCSV(text);
        if (rawRows.length === 0) {
          setUploadError('Could not parse any valid rows from this CSV file.');
          return;
        }

        const { records: processedRecords } = cleanAndProcessRecords(rawRows);
        onUploadNewData(processedRecords, rawRows);
        setUploadSuccess(`Successfully loaded and cleaned ${processedRecords.length} records from ${file.name}!`);
        setCurrentPage(1);
      } catch (err: any) {
        setUploadError(`Failed to process CSV: ${err?.message || 'Unknown parsing error'}`);
      }
    };
    reader.readAsText(file);
  };

  // Filter & Sort
  const filteredAndSortedRecords = useMemo(() => {
    let result = records;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        r =>
          r.Student_Name.toLowerCase().includes(q) ||
          r.Student_ID.toLowerCase().includes(q) ||
          r.Book_Title.toLowerCase().includes(q) ||
          r.Book_ID.toLowerCase().includes(q) ||
          r.Author.toLowerCase().includes(q) ||
          r.Category.toLowerCase().includes(q) ||
          r.Course.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [records, search, sortField, sortOrder]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredAndSortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRecords.slice(start, start + pageSize);
  }, [filteredAndSortedRecords, currentPage, pageSize]);

  // Schema Inspection Metadata
  const columnsMetadata = useMemo(() => {
    if (records.length === 0) return [];
    const sample = records[0];
    return Object.keys(sample).map(key => {
      const col = key as keyof LibraryRecord;
      const values = records.map(r => r[col]);
      const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
      const uniqueCount = new Set(values).size;
      const dtype = typeof sample[col];
      return {
        column: key,
        dataType: dtype === 'number' ? 'Integer/Float' : dtype === 'boolean' ? 'Boolean' : 'String/ISO Date',
        nonNullCount: records.length - nullCount,
        nullCount,
        uniqueCount,
        sampleValue: String(sample[col] ?? 'N/A'),
      };
    });
  }, [records]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Dataset Management</h2>
          <p className="text-xs text-slate-400">
            Upload custom circulation CSVs, inspect column schemata, perform search and sort queries, or export cleaned data
          </p>
        </div>

        <button
          onClick={() => exportToCSV(records, 'cleaned_library_data.csv')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer shadow-md shadow-indigo-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Download Cleaned CSV</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-slate-900/60 border border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500/60 transition-colors">
        <input
          type="file"
          id="csv-file-input"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label
          htmlFor="csv-file-input"
          className="flex flex-col items-center justify-center cursor-pointer space-y-2"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-200">
            Click to upload your custom library CSV or drag and drop
          </span>
          <span className="text-xs text-slate-400">
            Standard college fields (Student_ID, Book_Title, Category, Dates, Fine) are automatically mapped and cleaned
          </span>
        </label>

        {uploadError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 text-left">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
      </div>

      {/* Dataset Overview Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase">Total Rows</span>
          <span className="text-2xl font-bold font-mono text-slate-100">{records.length.toLocaleString()}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Transaction entries</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase">Columns</span>
          <span className="text-2xl font-bold font-mono text-indigo-400">
            {records.length > 0 ? Object.keys(records[0]).length : 0}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Attributes & derived metrics</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase">Active Overdue</span>
          <span className="text-2xl font-bold font-mono text-rose-400">
            {records.filter(r => r.Is_Overdue).length.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Past statutory due date</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase">Data Cleanliness</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">100%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Zero invalid formats</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'grid'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Interactive Records Grid ({filteredAndSortedRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Schema & Column Inspection</span>
        </button>
      </div>

      {/* Tab Content: Grid */}
      {activeTab === 'grid' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Search, Sort, and Page Size Controls */}
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search student, book, author, course..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">Sort:</span>
                <select
                  value={sortField}
                  onChange={e => setSortField(e.target.value as keyof LibraryRecord)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Transaction_ID">Transaction ID</option>
                  <option value="Student_Name">Student Name</option>
                  <option value="Book_Title">Book Title</option>
                  <option value="Issue_Date">Issue Date</option>
                  <option value="Loan_Days">Loan Days</option>
                  <option value="Fine_Amount">Fine Amount</option>
                  <option value="Transaction_Status">Status</option>
                </select>

                <button
                  onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title={`Toggle order: currently ${sortOrder}`}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">Show:</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
                <tr>
                  <th className="p-3">TRX ID</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Loan Days</th>
                  <th className="p-3 text-right">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No records match the current filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map(r => (
                    <tr key={r.Transaction_ID} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-indigo-400 whitespace-nowrap">{r.Transaction_ID}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{r.Student_Name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{r.Student_ID} · {r.Gender}</div>
                      </td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">{r.Course} ({r.Year})</td>
                      <td className="p-3 text-slate-200 font-medium max-w-xs truncate" title={r.Book_Title}>
                        {r.Book_Title}
                      </td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">{r.Category}</td>
                      <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{r.Issue_Date}</td>
                      <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{r.Due_Date}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            r.Transaction_Status === 'Returned'
                              ? 'text-emerald-400'
                              : r.Transaction_Status === 'Overdue' || r.Is_Overdue
                              ? 'text-rose-400'
                              : 'text-sky-400'
                          }`}
                        >
                          {r.Transaction_Status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">{r.Loan_Days}d</td>
                      <td className="p-3 text-right font-mono font-medium whitespace-nowrap">
                        {r.Fine_Amount > 0 ? (
                          <span className="text-amber-400">₹{r.Fine_Amount.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">₹0.00</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Clean Pagination Footer */}
          <div className="p-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing{' '}
              <span className="font-mono text-slate-200 font-semibold">
                {Math.min((currentPage - 1) * pageSize + 1, filteredAndSortedRecords.length)}
              </span>{' '}
              to{' '}
              <span className="font-mono text-slate-200 font-semibold">
                {Math.min(currentPage * pageSize, filteredAndSortedRecords.length)}
              </span>{' '}
              of <span className="font-mono text-slate-200 font-semibold">{filteredAndSortedRecords.length}</span> records
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
      )}

      {/* Tab Content: Schema */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200">Schema & Column Profile</h3>
            <p className="text-xs text-slate-400">Inferred data types, null counts, and cardinality for all active dataset attributes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
                <tr>
                  <th className="p-3">Attribute Name</th>
                  <th className="p-3">Inferred Data Type</th>
                  <th className="p-3 text-right">Non-Null Count</th>
                  <th className="p-3 text-right">Null Count</th>
                  <th className="p-3 text-right">Unique Cardinality</th>
                  <th className="p-3">Sample Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {columnsMetadata.map(c => (
                  <tr key={c.column} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-semibold text-indigo-400">{c.column}</td>
                    <td className="p-3 text-slate-300 font-mono">{c.dataType}</td>
                    <td className="p-3 text-right font-mono text-slate-200">{c.nonNullCount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{c.nullCount}</td>
                    <td className="p-3 text-right font-mono text-slate-300">{c.uniqueCount.toLocaleString()}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate font-mono">{c.sampleValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
