"""
utils/recommendations.py
Rule-based inventory and purchasing recommendation engine.
Strictly non-AI, deterministic calculations based on circulation velocity and availability.
"""

import pandas as pd

def generate_inventory_recommendations(df, low_stock_threshold=3):
    """
    Evaluates circulation metrics per book title and yields deterministic purchasing rules.
    """
    if df is None or df.empty or "Book_ID" not in df.columns:
        return []

    # Aggregate by book
    book_stats = df.groupby(["Book_ID", "Book_Title", "Author", "Category"]).agg(
        Total_Borrowings=("Transaction_ID", "count"),
        Currently_Available=("Book_Availability", lambda x: (x == "Available").sum()),
        Currently_Issued=("Book_Availability", lambda x: (x == "Issued").sum()),
        Total_Copies=("Book_Availability", "count")
    ).reset_index()

    recommendations = []
    
    # Calculate demand percentiles
    median_demand = book_stats["Total_Borrowings"].median()
    high_demand_cutoff = book_stats["Total_Borrowings"].quantile(0.70)

    for _, row in book_stats.iterrows():
        b_id = row["Book_ID"]
        title = row["Book_Title"]
        borrow_count = row["Total_Borrowings"]
        avail = row["Currently_Available"]
        issued = row["Currently_Issued"]
        total = row["Total_Copies"]

        action_level = "Normal"
        rule_message = ""
        justification = ""

        if borrow_count >= high_demand_cutoff and avail <= low_stock_threshold:
            action_level = "Urgent Procurement"
            rule_message = "High demand — consider increasing inventory immediately."
            justification = f"Circulation velocity ({borrow_count} borrowings) is in top 30% while only {avail} copies remain available on shelves."
        elif borrow_count >= median_demand and avail == 0:
            action_level = "Restock Alert"
            rule_message = "Zero shelf availability — expedite return recalls or procure reserve copies."
            justification = f"All {issued} tracked copies are currently checked out with positive borrowing momentum."
        elif borrow_count < median_demand and avail > (low_stock_threshold * 2):
            action_level = "Excess Shelf Stock"
            rule_message = "Low demand — review future purchasing requirements before reordering."
            justification = f"Borrowing count is modest ({borrow_count}) with ample available shelf stock ({avail} copies)."
        else:
            action_level = "Adequate Stock"
            rule_message = "Stock levels are balanced relative to seasonal student borrowing demand."
            justification = f"Sufficient circulating buffer ({avail} available of {total} total copies)."

        recommendations.append({
            "Book_ID": b_id,
            "Book_Title": title,
            "Category": row["Category"],
            "Borrow_Count": borrow_count,
            "Available_Copies": avail,
            "Issued_Copies": issued,
            "Status": action_level,
            "Recommendation": rule_message,
            "Justification": justification
        })

    return recommendations
