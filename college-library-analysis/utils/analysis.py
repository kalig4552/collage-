"""
utils/analysis.py
Statistical calculations, aggregations, and business metrics for library data.
"""

import pandas as pd
import numpy as np

def calculate_kpis(df):
    """Calculates top-level library KPIs dynamically."""
    if df is None or df.empty:
        return {
            "total_books": 0, "total_students": 0, "total_transactions": 0,
            "books_issued": 0, "books_returned": 0, "overdue_books": 0,
            "available_books": 0, "total_fine": 0.0
        }
    
    total_transactions = len(df)
    total_books = df["Book_ID"].nunique() if "Book_ID" in df.columns else 0
    total_students = df["Student_ID"].nunique() if "Student_ID" in df.columns else 0

    status_counts = df["Transaction_Status"].value_counts().to_dict() if "Transaction_Status" in df.columns else {}
    books_issued = status_counts.get("Issued", 0)
    books_returned = status_counts.get("Returned", 0)
    overdue_books = status_counts.get("Overdue", 0)

    avail_counts = df["Book_Availability"].value_counts().to_dict() if "Book_Availability" in df.columns else {}
    available_books = avail_counts.get("Available", 0)
    
    total_fine = float(df["Fine_Amount"].sum()) if "Fine_Amount" in df.columns else 0.0

    return {
        "total_books": total_books,
        "total_students": total_students,
        "total_transactions": total_transactions,
        "books_issued": books_issued,
        "books_returned": books_returned,
        "overdue_books": overdue_books,
        "available_books": available_books,
        "total_fine": round(total_fine, 2)
    }

def get_top_borrowed_books(df, n=10):
    if df is None or df.empty or "Book_Title" not in df.columns:
        return pd.DataFrame()
    counts = df.groupby(["Book_ID", "Book_Title", "Author", "Category"]).size().reset_index(name="Borrow_Count")
    return counts.sort_values(by="Borrow_Count", ascending=False).head(n)

def get_top_students(df, n=10):
    if df is None or df.empty or "Student_ID" not in df.columns:
        return pd.DataFrame()
    cols = ["Student_ID", "Student_Name", "Course", "Year"]
    available_cols = [c for c in cols if c in df.columns]
    counts = df.groupby(available_cols).size().reset_index(name="Total_Borrowings")
    return counts.sort_values(by="Total_Borrowings", ascending=False).head(n)

def get_category_summary(df):
    if df is None or df.empty or "Category" not in df.columns:
        return pd.DataFrame()
    return df.groupby("Category").agg(
        Borrow_Count=("Book_ID", "count"),
        Unique_Books=("Book_ID", "nunique"),
        Total_Fine=("Fine_Amount", "sum")
    ).reset_index().sort_values(by="Borrow_Count", ascending=False)

def get_course_category_matrix(df):
    if df is None or df.empty or "Course" not in df.columns or "Category" not in df.columns:
        return pd.DataFrame()
    return pd.crosstab(df["Course"], df["Category"])

def get_overdue_records(df):
    if df is None or df.empty:
        return pd.DataFrame()
    # Filter by transaction status or is_overdue flag
    overdue_mask = (df["Transaction_Status"] == "Overdue") | (df.get("Is_Overdue", False) == True)
    overdue_df = df[overdue_mask].copy()
    if "Overdue_Days" in overdue_df.columns:
        overdue_df = overdue_df.sort_values(by="Overdue_Days", ascending=False)
    cols = ["Student_ID", "Student_Name", "Book_ID", "Book_Title", "Issue_Date", "Due_Date", "Return_Date", "Overdue_Days", "Fine_Amount"]
    avail_cols = [c for c in cols if c in overdue_df.columns]
    return overdue_df[avail_cols]

def calculate_numeric_correlations(df):
    if df is None or df.empty:
        return pd.DataFrame()
    num_cols = ["Age", "Publication_Year", "Loan_Days", "Overdue_Days", "Fine_Amount", "Borrow_Count"]
    avail_cols = [c for c in num_cols if c in df.columns]
    if len(avail_cols) < 2:
        return pd.DataFrame()
    return df[avail_cols].corr()
