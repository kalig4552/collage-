"""
pages/overdue.py
Overdue Analysis: Defaulter tracking, overdue durations, and penalty fine ledger.
"""

import streamlit as st
import pandas as pd
from utils.analysis import get_overdue_records

def render(df):
    st.markdown('<div class="main-title">Overdue Records & Fine Recovery Analysis</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Audit trail for overdue circulation, fine accruals, and student return compliance</div>', unsafe_allow_html=True)

    if df is None or df.empty:
        st.warning("No transaction data available.")
        return

    overdue_df = get_overdue_records(df)

    total_overdue_books = len(overdue_df)
    total_overdue_students = overdue_df["Student_ID"].nunique() if "Student_ID" in overdue_df.columns else 0
    total_fine = float(overdue_df["Fine_Amount"].sum()) if "Fine_Amount" in overdue_df.columns else 0.0
    avg_fine = round(total_fine / total_overdue_books, 2) if total_overdue_books > 0 else 0.0
    max_fine = float(overdue_df["Fine_Amount"].max()) if not overdue_df.empty and "Fine_Amount" in overdue_df.columns else 0.0

    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        st.metric("Overdue Loans", f"{total_overdue_books}")
    with c2:
        st.metric("Defaulter Students", f"{total_overdue_students}")
    with c3:
        st.metric("Total Fine Accrued", f"₹{total_fine:,.2f}")
    with c4:
        st.metric("Average Fine/Loan", f"₹{avg_fine:,.2f}")
    with c5:
        st.metric("Max Single Penalty", f"₹{max_fine:,.2f}")

    st.markdown("---")

    st.subheader("Overdue Loans Roster (Sorted by Overdue Duration)")
    if overdue_df.empty:
        st.success("🎉 No overdue transactions detected in the filtered subset!")
    else:
        st.dataframe(overdue_df, use_container_width=True, height=450)

        # Download Overdue Report CSV
        csv_bytes = overdue_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="⬇️ Export Overdue Defaulters CSV",
            data=csv_bytes,
            file_name="overdue_report.csv",
            mime="text/csv",
            type="primary"
        )
