/**
 * TypeScript definitions for College Library Management Data Analysis
 */

export interface LibraryRecord {
  Transaction_ID: string;
  Student_ID: string;
  Student_Name: string;
  Gender: string;
  Age: number;
  Course: string;
  Year: string;
  Book_ID: string;
  Book_Title: string;
  Author: string;
  Category: string;
  Publisher: string;
  Publication_Year: number;
  Issue_Date: string; // YYYY-MM-DD
  Due_Date: string;   // YYYY-MM-DD
  Return_Date: string; // YYYY-MM-DD or ""
  Transaction_Status: 'Returned' | 'Issued' | 'Overdue' | string;
  Fine_Amount: number;
  Book_Availability: 'Available' | 'Issued' | 'Reserved' | string;
  Library_Member: 'Yes' | 'No' | string;
  Borrow_Count: number;

  // Derived Features
  Loan_Days: number;
  Overdue_Days: number;
  Month: string;
  Year_Month: string;
  Quarter: string;
  Borrowing_Month: string;
  Is_Overdue: boolean;
}

export interface FilterState {
  dateRange: { start: string; end: string };
  course: string;
  year: string;
  gender: string;
  category: string;
  bookTitle: string;
  transactionStatus: string;
  searchQuery: string;
}

export interface CleaningStats {
  rowsBefore: number;
  rowsAfter: number;
  duplicatesRemoved: number;
  missingBefore: number;
  missingAfter: number;
  cleaningSteps: Array<{
    stage: string;
    description: string;
    outcome: string;
  }>;
}

export interface KPIStats {
  totalBooks: number;
  totalStudents: number;
  totalTransactions: number;
  booksIssued: number;
  booksReturned: number;
  overdueBooks: number;
  availableBooks: number;
  totalFine: number;
}

export interface InventoryRecommendation {
  Book_ID: string;
  Book_Title: string;
  Category: string;
  Borrow_Count: number;
  Available_Copies: number;
  Issued_Copies: number;
  Status: 'Urgent Procurement' | 'Restock Alert' | 'Excess Shelf Stock' | 'Adequate Stock';
  Recommendation: string;
  Justification: string;
}

export type PageSection =
  | 'home'
  | 'dashboard'
  | 'dataset'
  | 'cleaning'
  | 'eda'
  | 'books'
  | 'students'
  | 'categories'
  | 'transactions'
  | 'overdue'
  | 'inventory'
  | 'reports'
  | 'about'
  | 'python-project';
