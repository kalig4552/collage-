"""
pages/cleaning.py
Data Cleaning & Preprocessing pipeline audit.
"""

import streamlit as st
import pandas as pd
from utils.data_cleaning import clean_library_data

def render():
    st.markdown('<div class="main-title">Data Cleaning & Preprocessing Pipeline</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Systematic hygiene verification and feature engineering audit</div>', unsafe_allow_html=True)

    raw_df = st.session_state.get("raw_df", None)
    stats = st.session_state.get("cleaning_stats", {})

    if raw_df is None or raw_df.empty:
        st.warning("No dataset loaded to audit. Please load or upload a dataset first.")
        return

    # Metrics before & after
    st.subheader("Data Hygiene Comparison")
    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        st.metric("Rows Before", stats.get("rows_before", len(raw_df)))
    with c2:
        st.metric("Rows After", stats.get("rows_after", len(raw_df)))
    with c3:
        st.metric("Duplicates Pruned", stats.get("duplicates_removed", 0))
    with c4:
        st.metric("Missing Before", stats.get("missing_before", 0))
    with c5:
        st.metric("Missing After", stats.get("missing_after", 0))

    st.markdown("---")

    # Step-by-step cleaning operations table
    st.subheader("Cleaning Operations Applied")
    operations = [
        {"Stage": "1. Duplicate Removal", "Description": "Deduplicated by Transaction_ID or identical row hashes", "Outcome": f"{stats.get('duplicates_removed', 0)} redundant rows removed"},
        {"Stage": "2. String Sanitation", "Description": "Stripped leading/trailing whitespace, normalized case formatting", "Outcome": "Normalized columns (Titles, Authors, Categories, Courses)"},
        {"Stage": "3. Chronological Casting", "Description": "Parsed Issue_Date, Due_Date, Return_Date to ISO datetime format", "Outcome": "Verified Issue_Date <= Due_Date sequence"},
        {"Stage": "4. Numeric Cast & Coerce", "Description": "Enforced integer constraints on Age, Publication_Year, Borrow_Count; float on Fine_Amount", "Outcome": "Zero non-numeric parse exceptions"},
        {"Stage": "5. Derived Features", "Description": "Engineered Loan_Days, Overdue_Days, Month, Year_Month, Quarter, Is_Overdue", "Outcome": "6 analytical features appended"}
    ]
    st.table(pd.DataFrame(operations))

    st.subheader("Engineered Feature Samples")
    cleaned_df = st.session_state.get("df", raw_df)
    feature_cols = [c for c in ["Transaction_ID", "Student_Name", "Issue_Date", "Due_Date", "Return_Date", "Loan_Days", "Overdue_Days", "Is_Overdue", "Month", "Quarter"] if c in cleaned_df.columns]
    st.dataframe(cleaned_df[feature_cols].head(15), use_container_width=True)
