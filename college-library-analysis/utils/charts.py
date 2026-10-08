"""
utils/charts.py
Visual plotting utilities using Seaborn, Matplotlib, and Plotly.
"""

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

# Set cohesive academic theme
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams.update({
    "font.family": "sans-serif",
    "figure.autolayout": True,
    "axes.edgecolor": "#cbd5e1",
    "axes.linewidth": 0.8
})

def plot_monthly_trend(df):
    fig, ax = plt.subplots(figsize=(10, 4.5))
    if "Year_Month" in df.columns:
        trend = df.groupby("Year_Month").size().reset_index(name="Transactions")
        trend = trend.sort_values(by="Year_Month")
        sns.lineplot(data=trend, x="Year_Month", y="Transactions", marker="o", color="#4f46e5", linewidth=2.5, ax=ax)
        plt.xticks(rotation=45, ha="right")
        ax.set_title("Monthly Library Circulation Trend", fontsize=12, fontweight="bold", pad=12)
        ax.set_xlabel("Month", fontsize=10)
        ax.set_ylabel("Total Transactions", fontsize=10)
    return fig

def plot_top_books(df, top_n=10):
    fig, ax = plt.subplots(figsize=(10, 5))
    if "Book_Title" in df.columns:
        top_books = df["Book_Title"].value_counts().head(top_n)
        sns.barplot(x=top_books.values, y=top_books.index, palette="mako", ax=ax)
        ax.set_title(f"Top {top_n} Most Borrowed Titles", fontsize=12, fontweight="bold", pad=12)
        ax.set_xlabel("Borrow Count", fontsize=10)
        ax.set_ylabel("Book Title", fontsize=10)
    return fig

def plot_category_distribution(df):
    fig, ax = plt.subplots(figsize=(9, 4.5))
    if "Category" in df.columns:
        cat_counts = df["Category"].value_counts()
        sns.barplot(x=cat_counts.values, y=cat_counts.index, palette="viridis", ax=ax)
        ax.set_title("Distribution of Borrowings by Category", fontsize=12, fontweight="bold", pad=12)
        ax.set_xlabel("Total Borrowings", fontsize=10)
    return fig

def plot_transaction_status(df):
    fig, ax = plt.subplots(figsize=(6, 4))
    if "Transaction_Status" in df.columns:
        counts = df["Transaction_Status"].value_counts()
        colors = ["#10b981", "#3b82f6", "#ef4444"]
        ax.pie(counts.values, labels=counts.index, autopct="%1.1f%%", startangle=140, colors=colors[:len(counts)],
               wedgeprops=dict(width=0.45, edgecolor="white"))
        ax.set_title("Transaction Status Breakdown", fontsize=12, fontweight="bold")
    return fig

def plot_course_usage(df):
    fig, ax = plt.subplots(figsize=(9, 4.5))
    if "Course" in df.columns:
        course_counts = df["Course"].value_counts()
        sns.barplot(x=course_counts.values, y=course_counts.index, palette="crest", ax=ax)
        ax.set_title("Circulation by Student Academic Course", fontsize=12, fontweight="bold", pad=12)
        ax.set_xlabel("Borrow Count", fontsize=10)
    return fig

def plot_gender_and_year(df):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
    if "Gender" in df.columns:
        gender_counts = df["Gender"].value_counts()
        ax1.pie(gender_counts.values, labels=gender_counts.index, autopct="%1.1f%%", colors=["#6366f1", "#ec4899", "#8b5cf6"])
        ax1.set_title("Gender Breakdown", fontsize=11, fontweight="bold")
    if "Year" in df.columns:
        year_counts = df["Year"].value_counts()
        sns.barplot(x=year_counts.index, y=year_counts.values, palette="rocket", ax=ax2)
        ax2.set_title("Usage by Academic Year", fontsize=11, fontweight="bold")
        ax2.set_ylabel("Count")
    return fig

def plot_fine_distribution(df):
    fig, ax = plt.subplots(figsize=(8, 4))
    if "Fine_Amount" in df.columns:
        fines = df[df["Fine_Amount"] > 0]["Fine_Amount"]
        if not fines.empty:
            sns.histplot(fines, kde=True, bins=15, color="#f59e0b", ax=ax)
            ax.set_title("Overdue Fine Amount Distribution (Non-Zero)", fontsize=12, fontweight="bold", pad=12)
            ax.set_xlabel("Fine Amount (₹)", fontsize=10)
            ax.set_ylabel("Frequency", fontsize=10)
    return fig

def plot_correlation_heatmap(df):
    fig, ax = plt.subplots(figsize=(7, 5))
    num_cols = ["Age", "Publication_Year", "Loan_Days", "Overdue_Days", "Fine_Amount", "Borrow_Count"]
    avail = [c for c in num_cols if c in df.columns]
    if len(avail) >= 2:
        corr = df[avail].corr()
        sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f", vmin=-1, vmax=1, linewidths=0.5, ax=ax)
        ax.set_title("Pearson Correlation Matrix", fontsize=12, fontweight="bold", pad=12)
    return fig
