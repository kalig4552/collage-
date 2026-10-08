"""
utils/data_loader.py
Loads, caches, and validates library dataset from CSV.
"""

import os
import pandas as pd

DEFAULT_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "library_data.csv")

RECOMMENDED_COLUMNS = [
    "Student_ID", "Student_Name", "Gender", "Age", "Course", "Year",
    "Book_ID", "Book_Title", "Author", "Category", "Publisher", "Publication_Year",
    "Issue_Date", "Due_Date", "Return_Date", "Transaction_Status", "Fine_Amount",
    "Book_Availability", "Library_Member", "Borrow_Count"
]

def load_default_data():
    """Loads the pre-generated sample dataset."""
    if os.path.exists(DEFAULT_DATA_PATH):
        df = pd.read_csv(DEFAULT_DATA_PATH)
        return df, None
    return None, f"Default dataset not found at {DEFAULT_DATA_PATH}"

def load_user_csv(uploaded_file):
    """Loads a user-uploaded CSV file with validation."""
    if uploaded_file is None:
        return None, "No file provided"
    try:
        df = pd.read_csv(uploaded_file)
        if df.empty:
            return None, "Uploaded CSV file is empty"
        return df, None
    except Exception as e:
        return None, f"Error reading CSV: {str(e)}"

def validate_dataset(df):
    """Validates presence of essential columns and checks datatypes."""
    if df is None or df.empty:
        return False, ["Dataset is empty"]
    
    missing_cols = [col for col in RECOMMENDED_COLUMNS if col not in df.columns]
    warnings = []
    if missing_cols:
        warnings.append(f"Missing recommended columns: {', '.join(missing_cols)}")
        
    return True, warnings
