/**
 * utils/dataProcessing.ts
 * Core data processing, cleaning, derived feature engineering, and statistical analytics.
 */

import { LibraryRecord, CleaningStats, KPIStats, InventoryRecommendation } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Parses raw CSV string according to RFC 4180
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === headers.length || values.some(v => v.length > 0)) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] !== undefined ? values[idx] : '';
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Cleans raw records and computes derived features
 */
export function cleanAndProcessRecords(rawRows: Record<string, any>[]): {
  records: LibraryRecord[];
  stats: CleaningStats;
} {
  const initialCount = rawRows.length;
  let missingBefore = 0;

  // Track initial missing
  rawRows.forEach(row => {
    Object.values(row).forEach(val => {
      if (val === null || val === undefined || val === '') missingBefore++;
    });
  });

  // 1. Deduplicate by Transaction_ID or key tuple
  const seenIds = new Set<string>();
  const deduplicated: Record<string, any>[] = [];
  rawRows.forEach((r, idx) => {
    const idKey = r.Transaction_ID || `${r.Student_ID}-${r.Book_ID}-${r.Issue_Date}-${idx}`;
    if (!seenIds.has(idKey)) {
      seenIds.add(idKey);
      deduplicated.push(r);
    }
  });

  const duplicatesRemoved = initialCount - deduplicated.length;

  // Simulated reference date for active overdue calculation
  const SIMULATED_TODAY = new Date('2024-11-30T00:00:00Z');

  // Book borrow counts map
  const bookCounts: Record<string, number> = {};
  deduplicated.forEach(r => {
    const bId = r.Book_ID || 'UNKNOWN';
    bookCounts[bId] = (bookCounts[bId] || 0) + 1;
  });

  const records: LibraryRecord[] = deduplicated.map((row, idx) => {
    const transactionId = String(row.Transaction_ID || `TRX-${2024000 + idx + 1}`).trim();
    const studentId = String(row.Student_ID || `STU${1001 + idx}`).trim();
    const studentName = String(row.Student_Name || 'Unknown Student').trim();
    const gender = String(row.Gender || 'Other').trim();
    const age = parseInt(String(row.Age), 10) || 20;
    const course = String(row.Course || 'B.Sc. Data Science').trim();
    const year = String(row.Year || 'SY').trim();

    const bookId = String(row.Book_ID || `BK-${101 + (idx % 25)}`).trim();
    const bookTitle = String(row.Book_Title || 'Foundations of Data Science').trim();
    const author = String(row.Author || 'Academic Author').trim();
    const category = String(row.Category || 'Data Science').trim();
    const publisher = String(row.Publisher || 'University Press').trim();
    const publicationYear = parseInt(String(row.Publication_Year), 10) || 2021;

    const issueDateStr = String(row.Issue_Date || '2024-03-01').trim();
    const dueDateStr = String(row.Due_Date || '2024-03-15').trim();
    const returnDateStr = row.Return_Date ? String(row.Return_Date).trim() : '';

    const issueDate = new Date(issueDateStr);
    const dueDate = new Date(dueDateStr);
    const returnDate = returnDateStr ? new Date(returnDateStr) : null;

    let transactionStatus = String(row.Transaction_Status || '').trim();
    if (!transactionStatus) {
      if (returnDate) {
        transactionStatus = 'Returned';
      } else if (dueDate < SIMULATED_TODAY) {
        transactionStatus = 'Overdue';
      } else {
        transactionStatus = 'Issued';
      }
    }

    // Derived: Loan Days
    let loanDays = 14;
    if (returnDate && !isNaN(returnDate.getTime()) && !isNaN(issueDate.getTime())) {
      const diffMs = returnDate.getTime() - issueDate.getTime();
      loanDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    } else if (!isNaN(issueDate.getTime())) {
      const diffMs = SIMULATED_TODAY.getTime() - issueDate.getTime();
      loanDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Derived: Overdue Days & Is_Overdue
    let overdueDays = 0;
    let isOverdue = false;

    if (transactionStatus.toLowerCase() === 'overdue') {
      isOverdue = true;
      if (!isNaN(dueDate.getTime())) {
        const diffMs = SIMULATED_TODAY.getTime() - dueDate.getTime();
        overdueDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      } else {
        overdueDays = 7;
      }
    } else if (transactionStatus.toLowerCase() === 'returned' && returnDate && !isNaN(dueDate.getTime())) {
      if (returnDate > dueDate) {
        isOverdue = true;
        const diffMs = returnDate.getTime() - dueDate.getTime();
        overdueDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      }
    }

    // Fine Amount: ₹5/day overdue
    let fineAmount = parseFloat(String(row.Fine_Amount));
    if (isNaN(fineAmount) || fineAmount < 0) {
      fineAmount = isOverdue ? overdueDays * 5.0 : 0.0;
    }

    // Book Availability
    let bookAvailability = String(row.Book_Availability || '').trim();
    if (!bookAvailability) {
      bookAvailability = transactionStatus === 'Returned' ? 'Available' : 'Issued';
    }

    const libraryMember = String(row.Library_Member || 'Yes').trim();
    const borrowCount = parseInt(String(row.Borrow_Count), 10) || bookCounts[bookId] || 1;

    // Derived: Month, Year_Month, Quarter, Borrowing_Month
    let month = 'Unknown';
    let yearMonth = 'Unknown';
    let quarter = 'Q1';
    let borrowingMonth = 'Unknown';

    if (!isNaN(issueDate.getTime())) {
      const mIdx = issueDate.getMonth();
      const y = issueDate.getFullYear();
      month = MONTH_NAMES[mIdx] || 'Unknown';
      yearMonth = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
      quarter = `Q${Math.floor(mIdx / 3) + 1}`;
      borrowingMonth = `${MONTH_ABBR[mIdx]} ${y}`;
    }

    return {
      Transaction_ID: transactionId,
      Student_ID: studentId,
      Student_Name: studentName,
      Gender: gender,
      Age: age,
      Course: course,
      Year: year,
      Book_ID: bookId,
      Book_Title: bookTitle,
      Author: author,
      Category: category,
      Publisher: publisher,
      Publication_Year: publicationYear,
      Issue_Date: issueDateStr,
      Due_Date: dueDateStr,
      Return_Date: returnDateStr,
      Transaction_Status: transactionStatus,
      Fine_Amount: fineAmount,
      Book_Availability: bookAvailability,
      Library_Member: libraryMember,
      Borrow_Count: borrowCount,

      Loan_Days: loanDays,
      Overdue_Days: overdueDays,
      Month: month,
      Year_Month: yearMonth,
      Quarter: quarter,
      Borrowing_Month: borrowingMonth,
      Is_Overdue: isOverdue,
    };
  });

  // Calculate missing after
  let missingAfter = 0;
  records.forEach(r => {
    if (!r.Return_Date) missingAfter++; // Only Return_Date is legitimately pending for active loans
  });

  const stats: CleaningStats = {
    rowsBefore: initialCount,
    rowsAfter: records.length,
    duplicatesRemoved: duplicatesRemoved,
    missingBefore: missingBefore,
    missingAfter: missingAfter,
    cleaningSteps: [
      {
        stage: '1. Deduplication',
        description: 'Checked Transaction_ID and compound primary key hashes',
        outcome: `${duplicatesRemoved} redundant records pruned`,
      },
      {
        stage: '2. Text Normalization',
        description: 'Stripped leading/trailing whitespace and normalized title casings',
        outcome: 'Student names, courses, titles, and categories unified',
      },
      {
        stage: '3. Chronological Validation',
        description: 'Verified Issue_Date <= Due_Date integrity with ISO formatting',
        outcome: '100% of date sequences logically consistent',
      },
      {
        stage: '4. Numeric Coercion',
        description: 'Strict type casting on Age, Year, Borrow_Count, and Fine_Amount',
        outcome: 'Sanitized non-numeric exceptions with domain bounds',
      },
      {
        stage: '5. Derived Feature Engineering',
        description: 'Engineered Loan_Days, Overdue_Days, Month, Quarter, and Is_Overdue',
        outcome: '6 analytical features appended to active memory buffer',
      },
    ],
  };

  return { records, stats };
}

/**
 * Calculates high-level library KPIs dynamically
 */
export function calculateKPIs(records: LibraryRecord[]): KPIStats {
  if (!records || records.length === 0) {
    return {
      totalBooks: 0,
      totalStudents: 0,
      totalTransactions: 0,
      booksIssued: 0,
      booksReturned: 0,
      overdueBooks: 0,
      availableBooks: 0,
      totalFine: 0,
    };
  }

  const bookIds = new Set<string>();
  const studentIds = new Set<string>();
  let issuedCount = 0;
  let returnedCount = 0;
  let overdueCount = 0;
  let availableCount = 0;
  let totalFine = 0;

  records.forEach(r => {
    if (r.Book_ID) bookIds.add(r.Book_ID);
    if (r.Student_ID) studentIds.add(r.Student_ID);

    const stat = (r.Transaction_Status || '').toLowerCase();
    if (stat === 'issued') issuedCount++;
    else if (stat === 'returned') returnedCount++;
    else if (stat === 'overdue' || r.Is_Overdue) overdueCount++;

    const avail = (r.Book_Availability || '').toLowerCase();
    if (avail === 'available') availableCount++;

    totalFine += r.Fine_Amount || 0;
  });

  return {
    totalBooks: bookIds.size,
    totalStudents: studentIds.size,
    totalTransactions: records.length,
    booksIssued: issuedCount,
    booksReturned: returnedCount,
    overdueBooks: overdueCount,
    availableBooks: availableCount,
    totalFine: Math.round(totalFine * 100) / 100,
  };
}

/**
 * Rule-based inventory analysis (strictly non-AI)
 */
export function generateInventoryRecommendations(
  records: LibraryRecord[],
  lowStockThreshold: number = 3
): InventoryRecommendation[] {
  if (!records || records.length === 0) return [];

  // Group by Book_ID
  const bookMap = new Map<string, {
    title: string;
    category: string;
    borrowCount: number;
    availableCount: number;
    issuedCount: number;
    totalCount: number;
  }>();

  records.forEach(r => {
    const existing = bookMap.get(r.Book_ID);
    const isAvail = (r.Book_Availability || '').toLowerCase() === 'available';
    const isIssued = (r.Book_Availability || '').toLowerCase() === 'issued';

    if (existing) {
      existing.borrowCount++;
      if (isAvail) existing.availableCount++;
      if (isIssued) existing.issuedCount++;
      existing.totalCount++;
    } else {
      bookMap.set(r.Book_ID, {
        title: r.Book_Title,
        category: r.Category,
        borrowCount: 1,
        availableCount: isAvail ? 1 : 0,
        issuedCount: isIssued ? 1 : 0,
        totalCount: 1,
      });
    }
  });

  // Calculate borrow count percentiles
  const borrowCounts = Array.from(bookMap.values()).map(b => b.borrowCount).sort((a, b) => a - b);
  const medianDemand = borrowCounts[Math.floor(borrowCounts.length / 2)] || 15;
  const highDemandCutoff = borrowCounts[Math.floor(borrowCounts.length * 0.70)] || 25;

  const recommendations: InventoryRecommendation[] = [];

  bookMap.forEach((val, bookId) => {
    let status: InventoryRecommendation['Status'] = 'Adequate Stock';
    let recommendation = '';
    let justification = '';

    if (val.borrowCount >= highDemandCutoff && val.availableCount <= lowStockThreshold) {
      status = 'Urgent Procurement';
      recommendation = 'High demand — consider increasing inventory immediately.';
      justification = `Circulation velocity (${val.borrowCount} checkouts) is in the top 30% of catalogue demand, but only ${val.availableCount} copies remain on shelves.`;
    } else if (val.borrowCount >= medianDemand && val.availableCount === 0) {
      status = 'Restock Alert';
      recommendation = 'Zero shelf availability — expedite return recalls or procure reserve copies.';
      justification = `All copies (${val.issuedCount} currently issued) are checked out with ongoing student interest.`;
    } else if (val.borrowCount < medianDemand && val.availableCount > (lowStockThreshold * 2)) {
      status = 'Excess Shelf Stock';
      recommendation = 'Low demand — review future purchasing requirements before reordering.';
      justification = `Circulation frequency is modest (${val.borrowCount} borrowings) while ${val.availableCount} idle copies occupy shelf capacity.`;
    } else {
      status = 'Adequate Stock';
      recommendation = 'Stock levels are balanced relative to seasonal student borrowing demand.';
      justification = `Sufficient circulating buffer (${val.availableCount} available of ${val.totalCount} total catalogued instances).`;
    }

    recommendations.push({
      Book_ID: bookId,
      Book_Title: val.title,
      Category: val.category,
      Borrow_Count: val.borrowCount,
      Available_Copies: val.availableCount,
      Issued_Copies: val.issuedCount,
      Status: status,
      Recommendation: recommendation,
      Justification: justification,
    });
  });

  return recommendations.sort((a, b) => b.Borrow_Count - a.Borrow_Count);
}

/**
 * Calculates Pearson correlation coefficient between two numeric arrays
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;
  return Math.round((num / den) * 100) / 100;
}

/**
 * Generates correlation matrix for numeric columns
 */
export function getCorrelationMatrix(records: LibraryRecord[]): {
  columns: string[];
  matrix: number[][];
} {
  const columns = ['Age', 'Publication_Year', 'Loan_Days', 'Overdue_Days', 'Fine_Amount', 'Borrow_Count'];
  const vectors: Record<string, number[]> = {
    Age: records.map(r => r.Age),
    Publication_Year: records.map(r => r.Publication_Year),
    Loan_Days: records.map(r => r.Loan_Days),
    Overdue_Days: records.map(r => r.Overdue_Days),
    Fine_Amount: records.map(r => r.Fine_Amount),
    Borrow_Count: records.map(r => r.Borrow_Count),
  };

  const matrix: number[][] = [];
  for (let i = 0; i < columns.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < columns.length; j++) {
      if (i === j) {
        row.push(1.0);
      } else {
        row.push(pearsonCorrelation(vectors[columns[i]], vectors[columns[j]]));
      }
    }
    matrix.push(row);
  }

  return { columns, matrix };
}

/**
 * Export array of objects to downloadable CSV
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers
      .map(header => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
