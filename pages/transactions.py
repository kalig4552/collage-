"""
pages/transactions.py
Issue & Return Analysis: Circulation velocity, return adherence, and loan durations.
"""

import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def render(df):
    st.markdown('<div class="main-title">Issue & Return Circulation Dynamics</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Temporal velocity of borrowings, loan durations, and return completion rates</div>', unsafe_allow_html=True)

    if df is None or df.empty:
        st.warning("No transaction data available.")
        return

    total_issues = len(df)
    total_returns = (df["Transaction_Status"] == "Returned").sum() if "Transaction_Status" in df.columns else 0
    pending_returns = total_issues - total_returns
    avg_loan_days = round(df["Loan_Days"].mean(), 1) if "Loan_Days" in df.columns else 14.0

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric("Total Issues Logged", f"{total_issues}")
    with c2:
        st.metric("Confirmed Returns", f"{total_returns}")
    with c3:
        st.metric("Pending / Active Loans", f"{pending_returns}")
    with c4:
        st.metric("Avg Loan Duration", f"{avg_loan_days} days")

    st.markdown("---")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Monthly Issues vs. Returns Comparison")
        if "Year_Month" in df.columns:
            monthly_issues = df.groupby("Year_Month").size()
            monthly_returns = df[df["Transaction_Status"] == "Returned"].groupby("Year_Month").size()
            comp_df = pd.DataFrame({"Issues": monthly_issues, "Returns": monthly_returns}).fillna(0)

            fig, ax = plt.subplots(figsize=(8, 4.5))
            comp_df.plot(kind="line", marker="o", ax=ax, color=["#4f46e5", "#10b981"], linewidth=2.2)
            ax.set_title("Circulation Velocity: Issues vs Returns", fontsize=11, fontweight="bold")
            ax.set_ylabel("Transactions")
            plt.xticks(rotation=45, ha="right")
            st.pyplot(fig)

    with col2:
        st.subheader("Loan Duration Distribution (Days)")
        if "Loan_Days" in df.columns:
            fig, ax = plt.subplots(figsize=(8, 4.5))
            sns.histplot(df["Loan_Days"], bins=15, kde=True, color="#8b5cf6", ax=ax)
            ax.set_title("Student Borrowing Duration Histogram", fontsize=11, fontweight="bold")
            ax.set_xlabel("Days Kept")
            ax.axvline(14, color="red", linestyle="--", label="Standard Loan Period (14 Days)")
            ax.legend()
            st.pyplot(fig)

    st.subheader("Transaction Status Ratio")
    if "Transaction_Status" in df.columns:
        status_table = df["Transaction_Status"].value_counts().reset_index()
        status_table.columns = ["Status", "Count"]
        status_table["Percentage"] = (status_table["Count"] / len(df) * 100).round(2).astype(str) + "%"
        st.dataframe(status_table, use_container_width=True)
