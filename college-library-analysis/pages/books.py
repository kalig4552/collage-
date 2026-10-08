"""
pages/books.py
Books Analysis: inventory circulation, availability status, and top titles.
"""

import streamlit as st
import pandas as pd
from utils.charts import plot_top_books

def render(df):
    st.markdown('<div class="main-title">Book Circulation & Catalogue Analysis</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Inventory circulation depth, availability ratios, and title popularity</div>', unsafe_allow_html=True)

    if df is None or df.empty or "Book_ID" not in df.columns:
        st.warning("No book circulation data available.")
        return

    # Metrics
    total_unique_books = df["Book_ID"].nunique()
    issued_count = (df["Transaction_Status"] == "Issued").sum()
    avail_count = (df["Book_Availability"] == "Available").sum()
    most_borrowed_title = df["Book_Title"].value_counts().index[0] if "Book_Title" in df.columns else "N/A"
    most_borrowed_count = df["Book_Title"].value_counts().iloc[0] if "Book_Title" in df.columns else 0

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric("Unique Titles", f"{total_unique_books}")
    with c2:
        st.metric("Currently Issued", f"{issued_count}")
    with c3:
        st.metric("Currently Available", f"{avail_count}")
    with c4:
        st.metric("Top Title Borrowings", f"{most_borrowed_count}", help=most_borrowed_title)

    st.markdown("---")

    st.subheader("Top 10 Most Borrowed Books")
    st.pyplot(plot_top_books(df, 10))

    st.markdown("---")
    st.subheader("Detailed Catalogue & Circulation Roster")

    # Aggregate by book
    book_summary = df.groupby(["Book_ID", "Book_Title", "Author", "Category"]).agg(
        Total_Borrowings=("Transaction_ID", "count"),
        Current_Status=("Book_Availability", lambda x: x.iloc[-1]),
        Available_Copies=("Book_Availability", lambda x: (x == "Available").sum()),
        Issued_Copies=("Book_Availability", lambda x: (x == "Issued").sum())
    ).reset_index().sort_values(by="Total_Borrowings", ascending=False)

    st.dataframe(book_summary, use_container_width=True, height=450)

    # CSV Download for Book Analysis
    csv_bytes = book_summary.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="⬇️ Export Book Analysis CSV",
        data=csv_bytes,
        file_name="book_analysis_report.csv",
        mime="text/csv"
    )
