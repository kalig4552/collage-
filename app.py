"""
app.py
College Library Management Data Analysis
B.Sc. Data Science Academic Project - University of Mumbai
Main Streamlit application entry point.
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
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.1rem;
        color: #64748b;
        margin-bottom: 1.5rem;
    }
    .kpi-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
    }
    .kpi-val {
        font-size: 1.8rem;
        font-weight: 700;
        color: #4f46e5;
    }
    .kpi-lbl {
        font-size: 0.85rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
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
    "Home",
    "Dashboard",
    "Dataset",
    "Data Cleaning",
    "EDA",
    "Books Analysis",
    "Student Analysis",
    "Category Analysis",
    "Issue & Return Analysis",
    "Overdue Analysis",
    "Inventory Analysis",
    "Reports",
    "About"
]

selected_page = st.sidebar.radio("Navigate Sections", menu_options)

# Sidebar Global Filters (when dataset is present)
active_df = st.session_state.get("df", None)
filtered_df = active_df

if active_df is not None and not active_df.empty:
    st.sidebar.markdown("---")
    st.sidebar.subheader("🔍 Global Filters")

    # Reset button
    if st.sidebar.button("Reset Filters"):
        st.session_state["filter_course"] = "All"
        st.session_state["filter_year"] = "All"
        st.session_state["filter_gender"] = "All"
        st.session_state["filter_cat"] = "All"
        st.session_state["filter_status"] = "All"
        st.rerun()

    # Filter Course
    courses = ["All"] + sorted(list(active_df["Course"].dropna().unique())) if "Course" in active_df.columns else ["All"]
    sel_course = st.sidebar.selectbox("Course", courses, key="filter_course")

    # Filter Year
    years = ["All"] + sorted(list(active_df["Year"].dropna().unique())) if "Year" in active_df.columns else ["All"]
    sel_year = st.sidebar.selectbox("Academic Year", years, key="filter_year")

    # Filter Gender
    genders = ["All"] + sorted(list(active_df["Gender"].dropna().unique())) if "Gender" in active_df.columns else ["All"]
    sel_gender = st.sidebar.selectbox("Gender", genders, key="filter_gender")

    # Filter Category
    categories = ["All"] + sorted(list(active_df["Category"].dropna().unique())) if "Category" in active_df.columns else ["All"]
    sel_category = st.sidebar.selectbox("Book Category", categories, key="filter_cat")

    # Filter Status
    statuses = ["All"] + sorted(list(active_df["Transaction_Status"].dropna().unique())) if "Transaction_Status" in active_df.columns else ["All"]
    sel_status = st.sidebar.selectbox("Transaction Status", statuses, key="filter_status")

    # Apply filters dynamically
    mask = pd.Series([True] * len(active_df), index=active_df.index)
    if sel_course != "All":
        mask &= (active_df["Course"] == sel_course)
    if sel_year != "All":
        mask &= (active_df["Year"] == sel_year)
    if sel_gender != "All":
        mask &= (active_df["Gender"] == sel_gender)
    if sel_category != "All":
        mask &= (active_df["Category"] == sel_category)
    if sel_status != "All":
        mask &= (active_df["Transaction_Status"] == sel_status)

    filtered_df = active_df[mask]
    st.sidebar.caption(f"Showing {len(filtered_df)} of {len(active_df)} transactions")

st.session_state["filtered_df"] = filtered_df

# Routing logic
from pages import (
    home, dashboard, dataset, cleaning, eda,
    books, students, categories, transactions,
    overdue, inventory, reports, about
)

if selected_page == "Home":
    home.render()
elif selected_page == "Dashboard":
    dashboard.render(filtered_df)
elif selected_page == "Dataset":
    dataset.render()
elif selected_page == "Data Cleaning":
    cleaning.render()
elif selected_page == "EDA":
    eda.render(filtered_df)
elif selected_page == "Books Analysis":
    books.render(filtered_df)
elif selected_page == "Student Analysis":
    students.render(filtered_df)
elif selected_page == "Category Analysis":
    categories.render(filtered_df)
elif selected_page == "Issue & Return Analysis":
    transactions.render(filtered_df)
elif selected_page == "Overdue Analysis":
    overdue.render(filtered_df)
elif selected_page == "Inventory Analysis":
    inventory.render(filtered_df)
elif selected_page == "Reports":
    reports.render(filtered_df)
elif selected_page == "About":
    about.render()
