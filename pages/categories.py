"""
pages/categories.py
Subject Category Analysis & Course Cross-Tabulation.
"""

import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from utils.charts import plot_category_distribution

def render(df):
    st.markdown('<div class="main-title">Category & Subject Domain Analysis</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Disciplinary reading patterns and cross-departmental subject affinity</div>', unsafe_allow_html=True)

    if df is None or df.empty or "Category" not in df.columns:
        st.warning("No category data available.")
        return

    cat_counts = df["Category"].value_counts()
    total_cats = len(cat_counts)
    top_cat = cat_counts.index[0] if not cat_counts.empty else "N/A"
    top_cat_count = cat_counts.iloc[0] if not cat_counts.empty else 0
    lowest_cat = cat_counts.index[-1] if not cat_counts.empty else "N/A"
    lowest_cat_count = cat_counts.iloc[-1] if not cat_counts.empty else 0

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric("Total Subject Domains", f"{total_cats}")
    with c2:
        st.metric("Most Popular Category", top_cat, delta=f"{top_cat_count} borrows")
    with c3:
        st.metric("Lowest Circulation Category", lowest_cat, delta=f"{lowest_cat_count} borrows")
    with c4:
        st.metric("Avg Borrows / Domain", f"{round(len(df)/total_cats, 1)}")

    st.markdown("---")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Category-wise Borrowing Distribution")
        st.pyplot(plot_category_distribution(df))
    with col2:
        st.subheader("Category Availability Breakdown")
        avail_cat = df.groupby(["Category", "Book_Availability"]).size().unstack(fill_value=0)
        fig, ax = plt.subplots(figsize=(8, 4.5))
        avail_cat.plot(kind="bar", stacked=True, ax=ax, colormap="viridis")
        ax.set_ylabel("Count")
        ax.set_title("Availability by Subject", fontsize=11, fontweight="bold")
        plt.xticks(rotation=45, ha="right")
        st.pyplot(fig)

    st.markdown("---")
    st.subheader("Cross-Tabulation Matrix: Academic Course vs. Book Category")
    if "Course" in df.columns:
        crosstab_matrix = pd.crosstab(df["Course"], df["Category"])
        st.dataframe(crosstab_matrix, use_container_width=True)

        fig, ax = plt.subplots(figsize=(10, 5))
        sns.heatmap(crosstab_matrix, annot=True, fmt="d", cmap="YlGnBu", cbar=True, ax=ax)
        ax.set_title("Heatmap of Departmental Course Preference Across Categories", fontsize=11, fontweight="bold")
        st.pyplot(fig)

    # Category CSV Export
    cat_summary = df.groupby("Category").agg(
        Total_Borrowings=("Transaction_ID", "count"),
        Unique_Titles=("Book_ID", "nunique"),
        Total_Fines=("Fine_Amount", "sum")
    ).reset_index().sort_values(by="Total_Borrowings", ascending=False)

    csv_bytes = cat_summary.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="⬇️ Export Category Analysis CSV",
        data=csv_bytes,
        file_name="category_analysis_report.csv",
        mime="text/csv"
    )
