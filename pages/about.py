"""
pages/about.py
Academic credentials, project methodology, and future scope.
"""

import streamlit as st

def render():
    st.markdown('<div class="main-title">About the Academic Project</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Institutional background, methodology lifecycle, and research candidate details</div>', unsafe_allow_html=True)

    col1, col2 = st.columns([3, 2])
    with col1:
        st.markdown("""
        ### Academic Candidate Details
        * **Project Title:** College Library Management Data Analysis
        * **Student Candidate:** **Kali Gupta**
        * **Degree Program:** B.Sc. Data Science
        * **Academic Semester:** Semester V
        * **College / Institution:** **D.T.S.S. College of Commerce (Autonomous)**
        * **Affiliated University:** **University of Mumbai**
        
        ---
        ### Project Rationale
        The primary objective of this project is to apply empirical Data Science methodologies to institutional
        library administration. Rather than treating circulation ledgers as static record logs, this platform
        treats every checkout as a behavioral data point. Through systematic data hygiene, derived feature engineering,
        and exploratory statistical profiling, college administrators can make evidence-backed procurement,
        fine policy, and departmental resource decisions.
        """)

    with col2:
        st.info("""
        **Evaluation & Viva Readiness**
        * **Platform:** Python 3.10 / Streamlit / Pandas
        * **Architecture:** 100% Local-First & API-Free
        * **Security:** Zero Cloud Database / In-Memory
        * **Algorithm Mode:** Deterministic Rule-Based
        * **Reproducibility:** Seeded Dataset & Full Source
        """)

    st.markdown("---")
    st.subheader("Data Science Methodology Lifecycle")
    st.markdown("""
    The application strictly adheres to the ten-stage Data Science research workflow:
    
    1. **Data Collection:** Sourcing transaction records with 20 distinct attributes.
    2. **Data Cleaning:** Pruning duplicate entries, stripping whitespace, and normalizing category terminology.
    3. **Data Preprocessing:** Standardizing date formats and validating chronological sequencing ($Issue \\le Due$).
    4. **Feature Engineering:** Deriving analytical metrics: `Loan_Days`, `Overdue_Days`, `Month`, `Year_Month`, `Quarter`, and `Is_Overdue`.
    5. **Exploratory Data Analysis (EDA):** Computing parametric and non-parametric central tendencies and distributions.
    6. **Visualization:** Rendering univariate, bivariate, and multivariate distribution charts.
    7. **Statistical Analysis:** Computing Pearson correlation matrices and course-category cross-tabulations.
    8. **Insight Generation:** Identifying circulation velocity, overdue hotspots, and demand trends.
    9. **Recommendations:** Applying deterministic stock replenishment rules without external AI dependence.
    10. **Reporting & Exports:** Generating academic summary tables and download-ready RFC-4180 CSV files.
    """)

    st.markdown("---")
    st.subheader("Future Scope")
    st.markdown("""
    Prospective future extensions for broader institutional adoption:
    * **Full Web LMS Integration:** Bi-directional synchronization with institutional ERP databases.
    * **Online Book Reservation System:** Real-time hold requests and reservation queues for students.
    * **Barcode & QR Scanner Support:** WebUSB / Camera-based instant checkout at library circulation desks.
    * **Role-Based Authentication:** Dedicated self-service student portals and administrative librarian dashboards.
    * **Cross-Platform Mobile App:** Push notifications for upcoming due dates and renewal requests.
    * **Machine Learning Demand Forecasting:** Time-series forecasting (ARIMA / Prophet / XGBoost) for seasonal textbook demand.
    * **Content-Based & Collaborative Recommendation Engine:** Recommending research papers and textbooks tailored to student course syllabi.
    * **Cloud-Native Deployment:** Containerized microservices deployment on scalable institutional infrastructure.
    """)
