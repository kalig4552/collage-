"""
pages/students.py
Student Borrowing Analysis & Demographics.
"""

import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def render(df):
    st.markdown('<div class="main-title">Student Borrowing & Demographics Analysis</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Student engagement, department participation, and active borrower rankings</div>', unsafe_allow_html=True)

    if df is None or df.empty or "Student_ID" not in df.columns:
        st.warning("No student data available.")
        return

    total_students = df["Student_ID"].nunique()
    total_tx = len(df)
    avg_per_student = round(total_tx / total_students, 2) if total_students > 0 else 0

    student_counts = df.groupby(["Student_ID", "Student_Name", "Course", "Year"]).size().reset_index(name="Total_Borrowings")
    student_counts = student_counts.sort_values(by="Total_Borrowings", ascending=False)
    max_borrowings = student_counts["Total_Borrowings"].max() if not student_counts.empty else 0

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric("Total Students Active", f"{total_students}")
    with c2:
        st.metric("Average Borrowings/Student", f"{avg_per_student}")
    with c3:
        st.metric("Peak Individual Activity", f"{max_borrowings} books")
    with c4:
        member_pct = round((df["Library_Member"] == "Yes").mean() * 100, 1) if "Library_Member" in df.columns else 100
        st.metric("Registered Member Ratio", f"{member_pct}%")

    st.markdown("---")

    col1, col2 = st.columns([3, 2])
    with col1:
        st.subheader("Top 10 Most Active Student Borrowers")
        st.dataframe(student_counts.head(10), use_container_width=True)

    with col2:
        st.subheader("Borrowing Distribution by Course")
        if "Course" in df.columns:
            course_dist = df["Course"].value_counts()
            fig, ax = plt.subplots(figsize=(6, 4.5))
            sns.barplot(x=course_dist.values, y=course_dist.index, palette="Blues_r", ax=ax)
            ax.set_xlabel("Total Transactions")
            st.pyplot(fig)

    # Student Analysis CSV Export
    csv_bytes = student_counts.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="⬇️ Export Student Analysis CSV",
        data=csv_bytes,
        file_name="student_analysis_report.csv",
        mime="text/csv"
    )
