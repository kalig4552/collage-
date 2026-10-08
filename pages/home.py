"""
pages/home.py
Landing page for College Library Management Data Analysis.
"""

import streamlit as st

def render():
    st.markdown('<div class="main-title">College Library Management Data Analysis</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Data-driven insights for better library management</div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("""
        ### Project Overview
        Modern academic libraries serve as intellectual nerve centers, managing substantial collections of 
        monographs, technical textbooks, and research publications across multiple academic disciplines.
        
        This **Data Analysis Platform** is an empirical decision-support system built for academic evaluators,
        librarians, and college administrators. By analyzing circulation transactions, the system transforms
        flat CSV records into actionable behavioral patterns, overdue risk profiles, demand curves, and inventory forecasts.
        
        ### Key Features
        * **100% Local & Privacy-Preserving:** No external APIs, cloud databases, or telemetry tracking.
        * **Dynamic Executive Dashboard:** Real-time KPI cards recalculating over dynamic multi-dimensional filters.
        * **Automated Data Hygiene:** Duplicate elimination, date integrity checks, and derived feature engineering.
        * **Fine & Overdue Tracking:** Defaulter identification, overdue duration analytics, and collection accounting.
        * **Deterministic Inventory Rules:** Demand-versus-availability purchasing alerts (strictly rule-based).
        * **Full Audit & Exportability:** Download clean datasets, overdue notices, and full academic report summaries.
        """)

        btn_c1, btn_c2 = st.columns(2)
        with btn_c1:
            if st.button("📊 Open Dashboard", use_container_width=True, type="primary"):
                st.session_state["nav_target"] = "Dashboard"
                st.info("Select 'Dashboard' from the left sidebar to explore live KPIs and visual charts.")
        with btn_c2:
            if st.button("📁 Upload Dataset", use_container_width=True):
                st.session_state["nav_target"] = "Dataset"
                st.info("Select 'Dataset' from the left sidebar to inspect or upload custom CSV logs.")

    with col2:
        st.info("""
        **Academic Project Details**
        * **Degree:** B.Sc. Data Science
        * **Semester:** V
        * **Candidate:** Kali Gupta
        * **College:** D.T.S.S. College of Commerce (Autonomous)
        * **University:** University of Mumbai
        * **Architecture:** Python / Streamlit / Pandas
        """)

        st.markdown("""
        #### System Status
        * **Engine:** Active
        * **Data Mode:** Local InMemory
        * **Rule Engine:** Deterministic
        * **API Keys Required:** None (0)
        """)

    st.markdown("---")
    st.subheader("Methodology Workflow")
    st.markdown("""
    ```
    Data Collection  ──▶  Data Cleaning  ──▶  Feature Engineering  ──▶  Exploratory Analysis (EDA)
                                                                               │
    Reporting & CSV  ◀──  Recommendations ◀──  Statistical Profiling ◀────────┘
    ```
    """)
