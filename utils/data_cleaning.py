"""
utils/data_cleaning.py
Data hygiene, preprocessing, and derived feature engineering.
"""

import pandas as pd
import numpy as np

def clean_library_data(raw_df):
    """
    Cleans raw library transactions and derives feature columns.
    Returns: cleaned_df, cleaning_stats_dict
    """
    if raw_df is None or raw_df.empty:
        return raw_df, {}

    df = raw_df.copy()
    initial_rows = len(df)
    initial_missing = int(df.isna().sum().sum())

    # 1. Remove duplicate rows based on Transaction_ID or all columns
    if "Transaction_ID" in df.columns:
        df = df.drop_duplicates(subset=["Transaction_ID"])
    else:
        df = df.drop_duplicates()
    duplicates_removed = initial_rows - len(df)

    # 2. Text standardization
    text_cols = ["Student_Name", "Course", "Book_Title", "Author", "Category", "Publisher", "Transaction_Status", "Book_Availability"]
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    # 3. Numeric conversions with safe fallbacks
    if "Age" in df.columns:
        df["Age"] = pd.to_numeric(df["Age"], errors="coerce").fillna(20).astype(int)
    if "Publication_Year" in df.columns:
        df["Publication_Year"] = pd.to_numeric(df["Publication_Year"], errors="coerce").fillna(2020).astype(int)
    if "Fine_Amount" in df.columns:
        df["Fine_Amount"] = pd.to_numeric(df["Fine_Amount"], errors="coerce").fillna(0.0)
    if "Borrow_Count" in df.columns:
        df["Borrow_Count"] = pd.to_numeric(df["Borrow_Count"], errors="coerce").fillna(1).astype(int)

    # 4. Date conversions
    for date_col in ["Issue_Date", "Due_Date", "Return_Date"]:
        if date_col in df.columns:
            df[date_col] = pd.to_datetime(df[date_col], errors="coerce")

    # 5. Derived Feature Engineering
    # Loan Days: duration between Return_Date (or Due_Date) and Issue_Date
    if "Issue_Date" in df.columns and "Return_Date" in df.columns:
        # If Return_Date is present, loan days is return - issue; else days until today or due
        loan_delta = (df["Return_Date"] - df["Issue_Date"]).dt.days
        df["Loan_Days"] = loan_delta.apply(lambda x: max(1, int(x)) if pd.notna(x) and x > 0 else 14)
    else:
        df["Loan_Days"] = 14

    # Overdue Days & Is_Overdue
    if "Due_Date" in df.columns:
        # If returned late
        if "Return_Date" in df.columns:
            late_returned = (df["Return_Date"] - df["Due_Date"]).dt.days
            late_returned = late_returned.apply(lambda x: int(x) if pd.notna(x) and x > 0 else 0)
        else:
            late_returned = 0

        # If still unreturned and past due
        curr_simulated_date = pd.to_datetime("2024-11-30")
        unreturned_late = (curr_simulated_date - df["Due_Date"]).dt.days
        is_unreturned = df["Return_Date"].isna() if "Return_Date" in df.columns else True

        calc_overdue_days = []
        is_overdue_flags = []
        for i, row in df.iterrows():
            stat = str(row.get("Transaction_Status", "")).lower()
            if stat == "overdue":
                days = max(1, int((curr_simulated_date - row["Due_Date"]).days)) if pd.notna(row.get("Due_Date")) else 7
                calc_overdue_days.append(days)
                is_overdue_flags.append(True)
            elif stat == "returned" and pd.notna(row.get("Return_Date")) and pd.notna(row.get("Due_Date")):
                diff = int((row["Return_Date"] - row["Due_Date"]).days)
                if diff > 0:
                    calc_overdue_days.append(diff)
                    is_overdue_flags.append(True)
                else:
                    calc_overdue_days.append(0)
                    is_overdue_flags.append(False)
            else:
                calc_overdue_days.append(0)
                is_overdue_flags.append(False)

        df["Overdue_Days"] = calc_overdue_days
        df["Is_Overdue"] = is_overdue_flags
    else:
        df["Overdue_Days"] = 0
        df["Is_Overdue"] = False

    # Month, Year_Month, Quarter, Borrowing_Month
    if "Issue_Date" in df.columns:
        df["Month"] = df["Issue_Date"].dt.month_name().fillna("Unknown")
        df["Year_Month"] = df["Issue_Date"].dt.strftime("%Y-%m").fillna("Unknown")
        df["Quarter"] = "Q" + df["Issue_Date"].dt.quarter.astype(str)
        df["Borrowing_Month"] = df["Issue_Date"].dt.strftime("%b %Y").fillna("Unknown")
    else:
        df["Month"] = "Unknown"
        df["Year_Month"] = "Unknown"
        df["Quarter"] = "Q1"
        df["Borrowing_Month"] = "Unknown"

    final_missing = int(df.isna().sum().sum())

    stats = {
        "rows_before": initial_rows,
        "rows_after": len(df),
        "duplicates_removed": duplicates_removed,
        "missing_before": initial_missing,
        "missing_after": final_missing
    }

    return df, stats
