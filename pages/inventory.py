"""
pages/inventory.py
Inventory & Stock Optimization: Rule-based procurement guidance without external AI.
"""

import streamlit as st
import pandas as pd
from utils.recommendations import generate_inventory_recommendations

def render(df):
    st.markdown('<div class="main-title">Inventory Stock & Purchasing Recommendations</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Algorithmic, deterministic inventory replenishment insights based on circulation velocity</div>', unsafe_allow_html=True)

    if df is None or df.empty or "Book_ID" not in df.columns:
        st.warning("No inventory records found.")
        return

    # Total inventory aggregates
    total_tracked_copies = len(df)
    avail_copies = (df["Book_Availability"] == "Available").sum() if "Book_Availability" in df.columns else 0
    issued_copies = (df["Book_Availability"] == "Issued").sum() if "Book_Availability" in df.columns else 0
    reserved_copies = total_tracked_copies - avail_copies - issued_copies

    # User-adjustable Low Stock Threshold
    st.sidebar.markdown("---")
    threshold = st.sidebar.slider("Low-Stock Alert Threshold (Copies)", min_value=1, max_value=10, value=3)

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric("Total Tracked Circulation", f"{total_tracked_copies}")
    with c2:
        st.metric("Available on Shelf", f"{avail_copies}")
    with c3:
        st.metric("Currently Checked Out", f"{issued_copies}")
    with c4:
        st.metric("Reserved / Maintenance", f"{reserved_copies}")

    st.markdown("---")

    recommendations = generate_inventory_recommendations(df, low_stock_threshold=threshold)
    recs_df = pd.DataFrame(recommendations)

    st.subheader(f"Procurement Action Directives (Threshold: ≤ {threshold} copies)")
    
    # Summary of rule triggers
    if not recs_df.empty:
        urgent_count = (recs_df["Status"] == "Urgent Procurement").sum()
        restock_count = (recs_df["Status"] == "Restock Alert").sum()
        excess_count = (recs_df["Status"] == "Excess Shelf Stock").sum()
        normal_count = (recs_df["Status"] == "Adequate Stock").sum()

        r1, r2, r3, r4 = st.columns(4)
        with r1:
            st.warning(f"🚨 Urgent Procurement: {urgent_count} titles")
        with r2:
            st.error(f"⚠️ Zero Stock Alert: {restock_count} titles")
        with r3:
            st.info(f"📦 Excess Shelf Stock: {excess_count} titles")
        with r4:
            st.success(f"✅ Balanced Stock: {normal_count} titles")

        st.markdown("---")
        st.dataframe(recs_df[["Book_ID", "Book_Title", "Category", "Borrow_Count", "Available_Copies", "Status", "Recommendation", "Justification"]], use_container_width=True, height=450)

        # Download Inventory CSV
        csv_bytes = recs_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="⬇️ Export Inventory Recommendations CSV",
            data=csv_bytes,
            file_name="inventory_procurement_report.csv",
            mime="text/csv"
        )
