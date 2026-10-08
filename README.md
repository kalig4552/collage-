# College Library Management Data Analysis

**Product Name:** Library Analytics  
**Academic Degree:** B.Sc. Data Science (Semester V)  
**Student Name:** Kali Gupta  
**College:** D.T.S.S. College of Commerce (Autonomous)  
**University:** University of Mumbai  
**Architecture:** 100% Local-First, Zero-Cloud, API-Free Decision Support System  

---

## 1. Project Overview
College libraries handle hundreds of book borrowing transactions every month across diverse academic departments. Traditional library records remain locked in raw CSV logs or static ledger tables, making it difficult for librarians and college administrators to assess book utilization, identify overdue patterns, monitor fine collections, track student engagement, and make timely inventory procurement decisions.

**Library Analytics** transforms raw library transactional data into an interactive, visual decision-support platform. Designed specifically for academic evaluation, library directors, and data science methodology demonstration, it provides deep exploratory data analysis (EDA), predictive trend analysis, inventory optimization rules, and downloadable reports without relying on any external APIs or cloud databases.

---

## 2. Problem Statement
Academic libraries face recurrent logistical and operational challenges:
- High-demand textbooks frequently face stockouts while niche titles remain idle.
- Overdue tracking relies on manual record-checking, leading to delayed recoveries and uncollected student fines.
- Library committees lack empirical, course-wise borrowing insights to justify book budget allocation.
- Inconsistent data logs (missing return dates, inconsistent formatting, casing discrepancies) prevent straightforward reporting.

---

## 3. Project Objectives
1. **Automate Data Preprocessing:** Implement automated cleaning pipelines that handle null values, remove duplicate issue logs, standardize course/category strings, and validate chronological date rules.
2. **Feature Engineering:** Derive analytical attributes including `Loan_Days`, `Overdue_Days`, `Month`, `Year_Month`, `Quarter`, and `Is_Overdue`.
3. **Exploratory Data Analysis (EDA):** Perform descriptive statistical profiling across student demographics, departmental courses, and book categories.
4. **Behavioral Analytics:** Detect student borrowing frequency, peak demand semesters, and top borrowing cohorts.
5. **Inventory Optimization:** Provide deterministic, rule-based recommendations for book replenishment based on borrowing velocity vs. shelf availability.
6. **Academic Reporting & Exportability:** Generate audit-ready CSV exports and comprehensive structured analytical summaries.

---

## 4. Key Features
- **Dynamic Executive Dashboard:** 8 reactive KPI cards with instant multi-criteria filtering (Date Range, Department Course, Academic Year, Gender, Category, Title, Status).
- **Data Hygiene & Preprocessing Suite:** Real-time visibility into raw vs. cleaned dataset metrics, duplicate trimming, and type casting.
- **Exploratory Data Analysis (EDA):** Univariate, bivariate, and categorical distributions with descriptive statistics (Mean, Median, Standard Deviation, Skewness, Min, Max).
- **Books & Category Analysis:** Circulation depth, author popularity rankings, and course-versus-category cross-tabulation matrix.
- **Student Engagement Profiling:** Top borrower leaderboards, course participation rates, and gender/year demographic breakdowns.
- **Issue & Return Monitoring:** Loan duration density distributions, return timeliness ratios, and outstanding circulation counts.
- **Overdue & Fine Recovery Engine:** Chronologically sorted overdue logs, fine totals, average overdue duration, and defaulter tracking.
- **Rule-Based Inventory Recommendations:** Non-AI algorithmic alerts flagging high-demand/low-availability items and stagnant stock.
- **Correlation Heatmap:** Pearson correlation coefficients across numerical attributes (Age, Publication Year, Loan Days, Overdue Days, Fine Amount, Borrow Count).
- **Multi-Format Export Hub:** Instant one-click CSV downloads for Cleaned Data, Overdue Defaulters, Book Analytics, Student Activity, and Comprehensive Summary.

---

## 5. Technology Stack
- **Primary Languages:** Python 3.10+, TypeScript
- **Data Manipulation:** Pandas, NumPy
- **Visualizations:** Matplotlib, Seaborn, Plotly, SVG Interactive Charts
- **Interactive Framework:** Streamlit (Python local runtime) + React 19 / Tailwind CSS (Interactive Web Workspace)
- **Export Engines:** CSV (RFC 4180 compliant), openpyxl, jszip
- **Cloud/API Dependency:** **0%** — Completely local execution, offline capable, zero external API keys.

---

## 6. Dataset Structure
The dataset schema contains 20 comprehensive fields reflecting realistic academic library circulation:

| Column Name | Data Type | Description |
|---|---|---|
| `Transaction_ID` | String | Unique circulation transaction identifier (e.g. TRX-2024001) |
| `Student_ID` | String | Unique student identification code (e.g. STU1001) |
| `Student_Name` | String | Full name of the student |
| `Gender` | String | Male / Female / Other |
| `Age` | Integer | Student age (18 to 24) |
| `Course` | String | Academic program (e.g. B.Sc. Data Science, B.Sc. CS, B.Com) |
| `Year` | String | Academic cohort year (FY, SY, TY) |
| `Book_ID` | String | Unique book catalogue code (e.g. BK-101) |
| `Book_Title` | String | Full title of the catalogue item |
| `Author` | String | Principal author name |
| `Category` | String | Subject domain (e.g. Data Science, Mathematics, Economics) |
| `Publisher` | String | Publishing house name |
| `Publication_Year` | Integer | Year of publication |
| `Issue_Date` | Date (YYYY-MM-DD) | Date the book was borrowed |
| `Due_Date` | Date (YYYY-MM-DD) | Scheduled return deadline |
| `Return_Date` | Date (YYYY-MM-DD) | Actual return date (blank if pending/overdue) |
| `Transaction_Status` | String | `Returned`, `Issued`, or `Overdue` |
| `Fine_Amount` | Float | Overdue fine calculated in local currency (₹5/day overdue) |
| `Book_Availability` | String | Current physical status (`Available`, `Issued`, `Reserved`) |
| `Library_Member` | String | Active library registration status (`Yes`, `No`) |
| `Borrow_Count` | Integer | Lifetime circulation count for the title |

---

## 7. Installation & Local Execution

### Prerequisites
- Python 3.9, 3.10, or 3.11 installed on your computer.

### Step 1: Clone or Navigate to the Project
```bash
cd college-library-analysis
```

### Step 2: Create a Virtual Environment (Recommended)
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Streamlit Application
```bash
streamlit run app.py
```
The application will launch automatically in your default browser at `http://localhost:8501`.

---

## 8. Application Modules & Architecture
```
college-library-analysis/
├── app.py                      # Main Streamlit orchestration & landing controller
├── generate_dataset.py         # Deterministic sample dataset generator (650+ records)
├── requirements.txt            # Python dependency specification
├── README.md                   # Full academic project documentation
├── data/
│   └── library_data.csv        # Pre-compiled realistic library transaction dataset
├── pages/
│   ├── dashboard.py            # KPI cards & dynamic cross-filter visualizations
│   ├── dataset.py              # File uploader, schema inspector & search grid
│   ├── cleaning.py             # Data quality audit, duplicate pruner & type fixer
│   ├── eda.py                  # Descriptive stats, distributions & author metrics
│   ├── books.py                # Book circulation, shelf status & top titles
│   ├── students.py             # Active students, department breakdown & borrower stats
│   ├── categories.py           # Domain popularity & course-category cross-tabulation
│   ├── transactions.py         # Issue vs return curves & loan duration analysis
│   ├── overdue.py              # Overdue rosters, fine totals & collection tracking
│   ├── inventory.py            # Stock thresholds & rule-based purchasing guidance
│   ├── reports.py              # Consolidated academic report generator & CSV exports
│   └── about.py                # Student credentials, methodology & academic viva details
├── utils/
│   ├── data_loader.py          # Cached CSV loading, validation & default fallback
│   ├── data_cleaning.py        # Hygiene pipeline & feature engineering calculations
│   ├── analysis.py             # Statistical aggregates & cross-tabulation routines
│   ├── charts.py               # Visual styling wrappers (Seaborn, Matplotlib, Plotly)
│   └── recommendations.py      # Deterministic inventory recommendation logic
└── outputs/                    # Output directory for exported reports and charts
```

---

## 9. Academic Methodology Workflow
The application embodies the end-to-end Data Science lifecycle:
1. **Data Collection:** Parsing student circulation logs from physical library records.
2. **Data Cleaning:** Eliminating redundant transactions, standardizing casing, stripping whitespace, and reconciling anomalous dates.
3. **Data Preprocessing & Validation:** Verifying chronological integrity (`Issue_Date` $\le$ `Due_Date`).
4. **Feature Engineering:** Deriving `Loan_Days`, `Overdue_Days`, `Year_Month`, and status flags.
5. **Exploratory Data Analysis:** Computing central tendencies, dispersion, and frequencies across all categories.
6. **Data Visualization:** Rendering multi-dimensional trends, distributions, and heatmaps.
7. **Statistical Cross-Tabulation:** Correlating student courses with book topics.
8. **Rule-Based Decision Logic:** Evaluating circulation velocity against shelf inventory to flag replenishment needs.
9. **Executive Reporting & Export:** Compiling audit tables and exportable datasets.

---

## 10. Limitations
- Single-institution circulation scope (inter-library loan data is not modeled).
- Fine calculation uses a linear daily penalty rate; tiered fine regimes (e.g. progressive overdue brackets) are not applied.
- Assumes single-copy availability tracking rather than shelf-level RFID tracking.

---

## 11. Future Scope
- Integration with RFID/Barcode scanner hardware via WebUSB/Serial APIs.
- Self-service automated student kiosk login with QR code generation.
- Machine Learning models for seasonal textbook demand forecasting (ARIMA / Prophet).
- Collaborative-filtering book recommendation engine based on course curriculum and peer borrowing history.
- Push notifications for due date reminders via SMS or institutional email gateways.

---

## 12. Conclusion
The **Library Analytics** project demonstrates how data science principles can be applied directly to institutional administration. By translating raw transaction logs into clear, actionable visual dashboards and inventory rules, the system empowers academic libraries to operate efficiently, eliminate manual fine disputes, and maximize textbook accessibility for students.
