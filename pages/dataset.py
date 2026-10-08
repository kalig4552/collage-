"""
pages/dataset.py
Dataset management: upload, schema inspection, search, sorting, and export.
"""

import streamlit as st
import pandas as pd
from utils.data_loader import load_user_csv, validate_dataset
from utils.data_cleaning import clean_library_data

def render():
    st.markdown('<div class="main-title">Dataset Management</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Upload, inspect, validate, and search transaction logs</div>', unsafe_allow_html=True)

    # File uploader
    uploaded_file = st.file_uploader("Upload Library Circulation CSV", type=["csv"], help="Upload an academic library transaction CSV file.")
    if uploaded_file is not None:
        user_df, err = load_user_csv(uploaded_file)
        if err:
            st.error(f"Failed to load file: {err}")
        else:
            is_valid, warnings = validate_dataset(user_df)
            if not is_valid:
                st.error("Uploaded file failed critical validation.")
            else:
                if warnings:
                    for w in warnings:
                        st.warning(w)
                cleaned, stats = clean_library_data(user_df)
                st.session_state["raw_df"] = user_df
                st.session_state["df"] = cleaned
                st.session_state["cleaning_stats"] = stats
                st.success(f"Successfully processed {len(cleaned)} records from {uploaded_file.name}!")

    active_df = st.session_state.get("df", None)
    if active_df is None or active_df.empty:
        st.info("No active dataset loaded. Please upload a CSV file or reload the default sample dataset.")
        return

    # Dataset Metadata Summary
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.metric("Total Rows", f"{len(active_df):,}")
    with m2:
        st.metric("Total Columns", f"{len(active_df.columns)}")
    with m3:
        missing_count = int(active_df.isna().sum().sum())
        st.metric("Missing Cells", f"{missing_count}")
    with m4:
        dup_count = int(active_df.duplicated().sum())
        st.metric("Duplicate Rows", f"{dup_count}")

    st.markdown("---")

    # Column Inspection Tab & Search Grid Tab
    tab1, tab2, tab3 = st.tabs(["🔍 Interactive Search & Filter Grid", "📋 Schema & Column Details", "📥 Data Export"])

    with tab1:
        search_query = st.text_input("Search records by Student Name, Book Title, or Author:", "")
        display_df = active_df
        if search_query:
            q = search_query.lower()
            mask = False
            for col in ["Student_Name", "Book_Title", "Author", "Student_ID", "Book_ID"]:
                if col in display_df.columns:
                    mask = mask | display_df[col].astype(str).str.lower().str.contains(q)
            display_df = display_df[mask]
            st.caption(f"Found {len(display_df)} matching records.")

        sort_col = st.selectbox("Sort records by:", list(display_df.columns), index=0)
        sort_order = st.radio("Order:", ["Ascending", "Descending"], horizontal=True)
        display_df = display_df.sort_values(by=sort_col, ascending=(sort_order == "Ascending"))

        st.dataframe(display_df, use_container_width=True, height=450)

    with tab2:
        col_info = []
        for c in active_df.columns:
            col_info.append({
                "Column Name": c,
                "Data Type": str(active_df[c].dtype),
                "Non-Null Count": int(active_df[c].notna().sum()),
                "Null Count": int(active_df[c].isna().sum()),
                "Unique Values": int(active_df[c].nunique()),
                "Sample Value": str(active_df[c].dropna().iloc[0]) if not active_df[c].dropna().empty else "N/A"
            })
        st.dataframe(pd.DataFrame(col_info), use_container_width=True)

    with tab3:
        st.markdown("#### Export Cleaned Dataset")
        csv_data = active_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="⬇️ Download Cleaned Library CSV",
            data=csv_data,
            file_name="cleaned_library_data.csv",
            mime="text/csv",
            type="primary"
        )
