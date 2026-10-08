"""
pages/dashboard.py
Executive dashboard displaying dynamic KPIs and core visualizations.
"""

import streamlit as st
from utils.analysis import calculate_kpis
from utils.charts import (
    plot_monthly_trend, plot_top_books, plot_category_distribution,
    plot_transaction_status, plot_course_usage, plot_gender_and_year,
    plot_fine_distribution
)

def render(df):
    st.markdown('<div class="main-title">Library Analytics Dashboard</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Real-time circulation metrics and performance indicators</div>', unsafe_allow_html=True)

    if df is None or df.empty:
        st.warning("No data available to display. Please verify filters or upload a dataset.")
        return

    # 1. Dynamic KPI Cards
    kpis = calculate_kpis(df)
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric("Total Books", f"{kpis['total_books']:,}")
        st.metric("Books Issued", f"{kpis['books_issued']:,}")
    with c2:
        st.metric("Total Students", f"{kpis['total_students']:,}")
        st.metric("Books Returned", f"{kpis['books_returned']:,}")
    with c3:
        st.metric("Total Transactions", f"{kpis['total_transactions']:,}")
        st.metric("Overdue Books", f"{kpis['overdue_books']:,}", delta=f"-{kpis['overdue_books']}" if kpis['overdue_books'] > 0 else None, delta_color="inverse")
    with c4:
        st.metric("Available Books", f"{kpis['available_books']:,}")
        st.metric("Total Fine", f"₹{kpis['total_fine']:,.2f}")

    st.markdown("---")

    # 2. Charts Grid
    row1_c1, row1_c2 = st.columns(2)
    with row1_c1:
        st.pyplot(plot_monthly_trend(df))
    with row1_c2:
        st.pyplot(plot_top_books(df, 10))

    row2_c1, row2_c2 = st.columns(2)
    with row2_c1:
        st.pyplot(plot_category_distribution(df))
    with row2_c2:
        st.pyplot(plot_transaction_status(df))

    row3_c1, row3_c2 = st.columns(2)
    with row3_c1:
        st.pyplot(plot_course_usage(df))
    with row3_c2:
        st.pyplot(plot_gender_and_year(df))

    st.pyplot(plot_fine_distribution(df))
