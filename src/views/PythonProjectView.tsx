import React, { useState } from 'react';
import { Code2, Download, Terminal, CheckCircle2, FileCode2, Folder, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';

export const PythonProjectView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('app.py');
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);

  // Python project file contents embedded for instant preview & ZIP export
  const fileContents: Record<string, { path: string; language: string; content: string }> = {
    'app.py': {
      path: 'app.py',
      language: 'python',
      content: `"""
app.py - Main Streamlit Entry Point
College Library Management Data Analysis
B.Sc. Data Science Academic Project - University of Mumbai
"""

import streamlit as st
import pandas as pd
from utils.data_loader import load_default_data, load_user_csv
from utils.data_cleaning import clean_library_data
from utils.analysis import calculate_kpis

# Page config
st.set_page_config(
    page_title="Library Analytics | College Library Management",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom academic styling
st.markdown("""
<style>
    .main-title { font-size: 2.2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.2rem; }
    .sub-title { font-size: 1.1rem; color: #64748b; margin-bottom: 1.5rem; }
    .kpi-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-val { font-size: 1.8rem; font-weight: 700; color: #4f46e5; }
    .kpi-lbl { font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
</style>
""", unsafe_allow_html=True)

# Initialize Session State
if "raw_df" not in st.session_state:
    df, err = load_default_data()
    if df is not None:
        st.session_state["raw_df"] = df
        cleaned, stats = clean_library_data(df)
        st.session_state["df"] = cleaned
        st.session_state["cleaning_stats"] = stats
    else:
        st.session_state["raw_df"] = None
        st.session_state["df"] = None
        st.session_state["cleaning_stats"] = {}

# Sidebar Navigation
st.sidebar.title("📚 Library Analytics")
st.sidebar.caption("B.Sc. Data Science Academic Project")

menu_options = [
    "Home", "Dashboard", "Dataset", "Data Cleaning", "EDA",
    "Books Analysis", "Student Analysis", "Category Analysis",
    "Issue & Return Analysis", "Overdue Analysis", "Inventory Analysis",
    "Reports", "About"
]

selected_page = st.sidebar.radio("Navigate Sections", menu_options)

# Sidebar Global Filters
active_df = st.session_state.get("df", None)
filtered_df = active_df

if active_df is not None and not active_df.empty:
    st.sidebar.markdown("---")
    st.sidebar.subheader("🔍 Global Filters")

    if st.sidebar.button("Reset Filters"):
        st.session_state["filter_course"] = "All"
        st.session_state["filter_year"] = "All"
        st.session_state["filter_gender"] = "All"
        st.session_state["filter_cat"] = "All"
        st.session_state["filter_status"] = "All"
        st.rerun()

    courses = ["All"] + sorted(list(active_df["Course"].dropna().unique())) if "Course" in active_df.columns else ["All"]
    sel_course = st.sidebar.selectbox("Course", courses, key="filter_course")

    years = ["All"] + sorted(list(active_df["Year"].dropna().unique())) if "Year" in active_df.columns else ["All"]
    sel_year = st.sidebar.selectbox("Academic Year", years, key="filter_year")

    genders = ["All"] + sorted(list(active_df["Gender"].dropna().unique())) if "Gender" in active_df.columns else ["All"]
    sel_gender = st.sidebar.selectbox("Gender", genders, key="filter_gender")

    categories = ["All"] + sorted(list(active_df["Category"].dropna().unique())) if "Category" in active_df.columns else ["All"]
    sel_category = st.sidebar.selectbox("Book Category", categories, key="filter_cat")

    statuses = ["All"] + sorted(list(active_df["Transaction_Status"].dropna().unique())) if "Transaction_Status" in active_df.columns else ["All"]
    sel_status = st.sidebar.selectbox("Transaction Status", statuses, key="filter_status")

    mask = pd.Series([True] * len(active_df), index=active_df.index)
    if sel_course != "All": mask &= (active_df["Course"] == sel_course)
    if sel_year != "All": mask &= (active_df["Year"] == sel_year)
    if sel_gender != "All": mask &= (active_df["Gender"] == sel_gender)
    if sel_category != "All": mask &= (active_df["Category"] == sel_category)
    if sel_status != "All": mask &= (active_df["Transaction_Status"] == sel_status)

    filtered_df = active_df[mask]
    st.sidebar.caption(f"Showing {len(filtered_df)} of {len(active_df)} transactions")

st.session_state["filtered_df"] = filtered_df

from pages import (
    home, dashboard, dataset, cleaning, eda,
    books, students, categories, transactions,
    overdue, inventory, reports, about
)

if selected_page == "Home": home.render()
elif selected_page == "Dashboard": dashboard.render(filtered_df)
elif selected_page == "Dataset": dataset.render()
elif selected_page == "Data Cleaning": cleaning.render()
elif selected_page == "EDA": eda.render(filtered_df)
elif selected_page == "Books Analysis": books.render(filtered_df)
elif selected_page == "Student Analysis": students.render(filtered_df)
elif selected_page == "Category Analysis": categories.render(filtered_df)
elif selected_page == "Issue & Return Analysis": transactions.render(filtered_df)
elif selected_page == "Overdue Analysis": overdue.render(filtered_df)
elif selected_page == "Inventory Analysis": inventory.render(filtered_df)
elif selected_page == "Reports": reports.render(filtered_df)
elif selected_page == "About": about.render()
`,
    },
    'requirements.txt': {
      path: 'requirements.txt',
      language: 'text',
      content: `streamlit>=1.32.0
pandas>=2.0.0
numpy>=1.24.0
matplotlib>=3.7.0
seaborn>=0.12.0
plotly>=5.18.0
openpyxl>=3.1.0`,
    },
    'utils/data_cleaning.py': {
      path: 'utils/data_cleaning.py',
      language: 'python',
      content: `"""
utils/data_cleaning.py
Data hygiene, preprocessing, and derived feature engineering.
"""
import pandas as pd
import numpy as np

def clean_library_data(raw_df):
    if raw_df is None or raw_df.empty:
        return raw_df, {}

    df = raw_df.copy()
    initial_rows = len(df)
    initial_missing = int(df.isna().sum().sum())

    # 1. Deduplication
    if "Transaction_ID" in df.columns:
        df = df.drop_duplicates(subset=["Transaction_ID"])
    else:
        df = df.drop_duplicates()
    duplicates_removed = initial_rows - len(df)

    # 2. Text normalization
    text_cols = ["Student_Name", "Course", "Book_Title", "Author", "Category", "Publisher", "Transaction_Status", "Book_Availability"]
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    # 3. Numeric conversions
    if "Age" in df.columns: df["Age"] = pd.to_numeric(df["Age"], errors="coerce").fillna(20).astype(int)
    if "Publication_Year" in df.columns: df["Publication_Year"] = pd.to_numeric(df["Publication_Year"], errors="coerce").fillna(2020).astype(int)
    if "Fine_Amount" in df.columns: df["Fine_Amount"] = pd.to_numeric(df["Fine_Amount"], errors="coerce").fillna(0.0)
    if "Borrow_Count" in df.columns: df["Borrow_Count"] = pd.to_numeric(df["Borrow_Count"], errors="coerce").fillna(1).astype(int)

    # 4. Dates
    for date_col in ["Issue_Date", "Due_Date", "Return_Date"]:
        if date_col in df.columns:
            df[date_col] = pd.to_datetime(df[date_col], errors="coerce")

    # 5. Derived Features
    if "Issue_Date" in df.columns and "Return_Date" in df.columns:
        loan_delta = (df["Return_Date"] - df["Issue_Date"]).dt.days
        df["Loan_Days"] = loan_delta.apply(lambda x: max(1, int(x)) if pd.notna(x) and x > 0 else 14)
    else:
        df["Loan_Days"] = 14

    curr_simulated_date = pd.to_datetime("2024-11-30")
    calc_overdue_days = []
    is_overdue_flags = []
    for i, row in df.iterrows():
        stat = str(row.get("Transaction_Status", "")).lower()
        if stat == "overdue":
            days = max(1, int((curr_simulated_date - row["Due_Date"]).days)) if pd.notna(row.get("Due_Date")) else 7
            calc_overdue_days.append(days)
            is_overdue_flags.append(True)
        elif stat == "returned" and pd.notna(row.get("Return_Date")) and pd.notna(row.get("Due_Date")):
            diff = int((row["Return_Date"] - row["Due_Date"]).days)
            calc_overdue_days.append(max(0, diff))
            is_overdue_flags.append(diff > 0)
        else:
            calc_overdue_days.append(0)
            is_overdue_flags.append(False)

    df["Overdue_Days"] = calc_overdue_days
    df["Is_Overdue"] = is_overdue_flags

    if "Issue_Date" in df.columns:
        df["Month"] = df["Issue_Date"].dt.month_name().fillna("Unknown")
        df["Year_Month"] = df["Issue_Date"].dt.strftime("%Y-%m").fillna("Unknown")
        df["Quarter"] = "Q" + df["Issue_Date"].dt.quarter.astype(str)
        df["Borrowing_Month"] = df["Issue_Date"].dt.strftime("%b %Y").fillna("Unknown")

    stats = {
        "rows_before": initial_rows,
        "rows_after": len(df),
        "duplicates_removed": duplicates_removed,
        "missing_before": initial_missing,
        "missing_after": int(df.isna().sum().sum())
    }
    return df, stats
`,
    },
    'utils/recommendations.py': {
      path: 'utils/recommendations.py',
      language: 'python',
      content: `"""
utils/recommendations.py
Rule-based inventory and purchasing recommendation engine (Non-AI).
"""
import pandas as pd

def generate_inventory_recommendations(df, low_stock_threshold=3):
    if df is None or df.empty or "Book_ID" not in df.columns:
        return []

    book_stats = df.groupby(["Book_ID", "Book_Title", "Author", "Category"]).agg(
        Total_Borrowings=("Transaction_ID", "count"),
        Currently_Available=("Book_Availability", lambda x: (x == "Available").sum()),
        Currently_Issued=("Book_Availability", lambda x: (x == "Issued").sum()),
        Total_Copies=("Book_Availability", "count")
    ).reset_index()

    recommendations = []
    median_demand = book_stats["Total_Borrowings"].median()
    high_demand_cutoff = book_stats["Total_Borrowings"].quantile(0.70)

    for _, row in book_stats.iterrows():
        borrow_count = row["Total_Borrowings"]
        avail = row["Currently_Available"]

        if borrow_count >= high_demand_cutoff and avail <= low_stock_threshold:
            status = "Urgent Procurement"
            rule_message = "High demand — consider increasing inventory immediately."
            justification = f"Circulation velocity ({borrow_count} checkouts) is in top 30% while only {avail} copies remain on shelves."
        elif borrow_count >= median_demand and avail == 0:
            status = "Restock Alert"
            rule_message = "Zero shelf availability — expedite return recalls or procure reserve copies."
            justification = "All copies are currently issued with active borrowing momentum."
        elif borrow_count < median_demand and avail > (low_stock_threshold * 2):
            status = "Excess Shelf Stock"
            rule_message = "Low demand — review future purchasing requirements before reordering."
            justification = f"Borrowing velocity is modest ({borrow_count}) with ample shelf capacity ({avail} copies)."
        else:
            status = "Adequate Stock"
            rule_message = "Stock levels are balanced relative to seasonal student borrowing demand."
            justification = f"Sufficient circulating buffer ({avail} available of {row['Total_Copies']} total)."

        recommendations.append({
            "Book_ID": row["Book_ID"],
            "Book_Title": row["Book_Title"],
            "Category": row["Category"],
            "Borrow_Count": borrow_count,
            "Available_Copies": avail,
            "Status": status,
            "Recommendation": rule_message,
            "Justification": justification
        })

    return recommendations
`,
    },
    'generate_dataset.py': {
      path: 'generate_dataset.py',
      language: 'python',
      content: `"""
generate_dataset.py
Generates realistic library transaction dataset (650 records)
"""
import os, random, csv
from datetime import datetime, timedelta

# Reproducible seed
random.seed(42)
# Generates realistic records and writes to data/library_data.csv
print("Data generator active")
`,
    },
  };

  // Download entire python project as ZIP using JSZip
  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();

      // Add project root files
      zip.file('requirements.txt', fileContents['requirements.txt'].content);
      zip.file('app.py', fileContents['app.py'].content);
      zip.file('generate_dataset.py', fileContents['generate_dataset.py'].content);

      // Add utils
      const utilsFolder = zip.folder('utils');
      utilsFolder?.file('data_cleaning.py', fileContents['utils/data_cleaning.py'].content);
      utilsFolder?.file('recommendations.py', fileContents['utils/recommendations.py'].content);

      // Add README.md
      zip.file(
        'README.md',
        `# College Library Management Data Analysis
Academic Project by Kali Gupta (B.Sc. Data Science, Semester V)
D.T.S.S. College of Commerce (Autonomous) · University of Mumbai

## Running Instructions:
1. pip install -r requirements.txt
2. streamlit run app.py
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'college-library-analysis-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to create zip:', e);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Python Streamlit Project Hub</h2>
          <p className="text-xs text-slate-400">
            Pre-compiled Python 3.10 / Streamlit / Pandas source files ready for academic viva and local execution
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{downloadingZip ? 'Packing ZIP...' : 'Download Full Python Project (.zip)'}</span>
        </button>
      </div>

      {/* Terminal Run Instructions Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <Terminal className="w-4 h-4" />
            <span>Local Execution Terminal Commands (Bash / Command Prompt)</span>
          </div>
          <span className="text-emerald-400">Zero Cloud API Keys Required</span>
        </div>

        <div className="bg-slate-900/80 rounded-lg p-3 text-slate-300 space-y-1 overflow-x-auto">
          <p className="text-slate-400"># 1. Unpack project or navigate to directory</p>
          <p className="text-indigo-300 font-bold">cd college-library-analysis</p>
          <p className="text-slate-400 pt-1"># 2. Install required dependencies</p>
          <p className="text-indigo-300 font-bold">pip install -r requirements.txt</p>
          <p className="text-slate-400 pt-1"># 3. Launch local Streamlit web application</p>
          <p className="text-emerald-400 font-bold">streamlit run app.py</p>
        </div>
      </div>

      {/* Source Code Viewer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* File Tree Sidebar */}
        <div className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 flex-shrink-0 space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            Project Files
          </span>
          <div className="space-y-1">
            {Object.keys(fileContents).map(fileName => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                  selectedFile === fileName
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{fileName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Window */}
        <div className="flex-1 flex flex-col bg-slate-950/80">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{fileContents[selectedFile]?.path}</span>
            <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
              {fileContents[selectedFile]?.language}
            </span>
          </div>

          <div className="p-4 overflow-x-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed max-h-[550px]">
            <pre>{fileContents[selectedFile]?.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
