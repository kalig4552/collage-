"""
generate_dataset.py
Generates a realistic library transaction dataset of 650+ records for
College Library Management Data Analysis academic project.
"""

import os
import random
from datetime import datetime, timedelta
import csv

# Seed for reproducibility
random.seed(42)

STUDENT_NAMES = [
    ("Aarav Sharma", "Male"), ("Ananya Verma", "Female"), ("Rohan Patil", "Male"),
    ("Sneha Kulkarni", "Female"), ("Aditya Nair", "Male"), ("Pooja Mehta", "Female"),
    ("Kavya Iyer", "Female"), ("Vikram Desai", "Male"), ("Riya Sen", "Female"),
    ("Karan Joshi", "Male"), ("Tanvi Deshmukh", "Female"), ("Arjun Pillai", "Male"),
    ("Priya Rao", "Female"), ("Siddharth Shah", "Male"), ("Meera Nambiar", "Female"),
    ("Rahul Gupta", "Male"), ("Neha Agarwal", "Female"), ("Manish Pandey", "Male"),
    ("Isha Roy", "Female"), ("Devendra Singh", "Male"), ("Simran Kaur", "Female"),
    ("Abhishek Shinde", "Male"), ("Deepika Hegde", "Female"), ("Gaurav Chawla", "Male"),
    ("Shruti Saxena", "Female"), ("Nikhil Kamat", "Male"), ("Bhavna Solanki", "Female"),
    ("Varun Bhat", "Male"), ("Payal Mishra", "Female"), ("Harshavardhan Kale", "Male"),
    ("Aishwarya Menon", "Female"), ("Pranav Sawant", "Male"), ("Divya Reddy", "Female"),
    ("Mayank Tiwari", "Male"), ("Saloni Parikh", "Female"), ("Samarth Varma", "Male"),
    ("Ankita Ghosh", "Female"), ("Yash Chauhan", "Male"), ("Kritika Das", "Female"),
    ("Kunal Mahajan", "Male"), ("Poonam Tambe", "Female"), ("Rakesh Shetty", "Male"),
    ("Swati Gokhale", "Female"), ("Suresh Choudhary", "Male"), ("Rashmi Jain", "Female"),
    ("Ashwin Venkatesh", "Male"), ("Pallavi Joshi", "Female"), ("Tejas Gaikwad", "Male"),
    ("Namrata Borkar", "Female"), ("Omkar Salunkhe", "Male")
]

COURSES = [
    "B.Sc. Data Science",
    "B.Sc. Computer Science",
    "B.Sc. IT",
    "B.Com",
    "B.A. Economics",
    "B.M.S.",
    "B.Sc. Statistics",
    "M.Sc. Data Science"
]

YEARS = ["FY", "SY", "TY"]

BOOKS = [
    ("BK-101", "Python for Data Analysis", "Wes McKinney", "Data Science", "O'Reilly Media", 2022),
    ("BK-102", "Hands-On Machine Learning with Scikit-Learn", "Aurélien Géron", "Artificial Intelligence", "O'Reilly Media", 2023),
    ("BK-103", "Introduction to Algorithms", "Thomas H. Cormen", "Computer Science", "MIT Press", 2020),
    ("BK-104", "Database System Concepts", "Abraham Silberschatz", "Database Systems", "McGraw-Hill", 2019),
    ("BK-105", "Clean Code: A Handbook of Agile Software Craftsmanship", "Robert C. Martin", "Software Engineering", "Prentice Hall", 2018),
    ("BK-106", "Linear Algebra and Its Applications", "Gilbert Strang", "Mathematics", "Cengage Learning", 2021),
    ("BK-107", "Principles of Economics", "N. Gregory Mankiw", "Economics", "Cengage Learning", 2020),
    ("BK-108", "Deep Learning", "Ian Goodfellow", "Artificial Intelligence", "MIT Press", 2016),
    ("BK-109", "Statistical Inference", "George Casella", "Mathematics", "Duxbury Press", 2017),
    ("BK-110", "Computer Networks: A Systems Approach", "Larry L. Peterson", "Computer Science", "Morgan Kaufmann", 2021),
    ("BK-111", "Operating System Concepts", "Peter B. Galvin", "Computer Science", "Wiley", 2021),
    ("BK-112", "Data Science from Scratch", "Joel Grus", "Data Science", "O'Reilly Media", 2019),
    ("BK-113", "Management Information Systems", "Kenneth C. Laudon", "Management", "Pearson Education", 2020),
    ("BK-114", "Design Patterns: Elements of Reusable Object-Oriented Software", "Erich Gamma", "Software Engineering", "Addison-Wesley", 2018),
    ("BK-115", "Artificial Intelligence: A Modern Approach", "Stuart Russell", "Artificial Intelligence", "Pearson Education", 2022),
    ("BK-116", "Fundamentals of Database Systems", "Ramez Elmasri", "Database Systems", "Pearson Education", 2021),
    ("BK-117", "Discrete Mathematics and Its Applications", "Kenneth H. Rosen", "Mathematics", "McGraw-Hill", 2019),
    ("BK-118", "The Pragmatic Programmer", "David Thomas", "Software Engineering", "Addison-Wesley", 2019),
    ("BK-119", "Corporate Finance", "Stephen A. Ross", "Management", "McGraw-Hill", 2022),
    ("BK-120", "Microeconomic Theory", "Andreu Mas-Colell", "Economics", "Oxford University Press", 2017),
    ("BK-121", "Pattern Recognition and Machine Learning", "Christopher M. Bishop", "Artificial Intelligence", "Springer", 2016),
    ("BK-122", "Storytelling with Data", "Cole Nussbaumer Knaflic", "Data Science", "Wiley", 2018),
    ("BK-123", "Cracking the Coding Interview", "Gayle Laakmann McDowell", "Computer Science", "CareerCup", 2020),
    ("BK-124", "Introduction to Probability Models", "Sheldon M. Ross", "Mathematics", "Academic Press", 2019),
    ("BK-125", "Financial Management: Theory & Practice", "Eugene F. Brigham", "Management", "Cengage Learning", 2021),
]

def generate_records(num_records=650):
    start_date = datetime(2024, 1, 5)
    end_date = datetime(2024, 11, 25)
    date_delta = (end_date - start_date).days

    records = []
    
    # Track student pool
    student_pool = []
    for i, (name, gender) in enumerate(STUDENT_NAMES):
        stu_id = f"STU{1001 + i}"
        age = random.randint(18, 23)
        course = random.choice(COURSES)
        year = random.choice(YEARS)
        library_member = "Yes" if random.random() > 0.08 else "No"
        student_pool.append({
            "id": stu_id,
            "name": name,
            "gender": gender,
            "age": age,
            "course": course,
            "year": year,
            "member": library_member
        })

    # Track book borrow counts
    book_borrow_counts = {bk[0]: 0 for bk in BOOKS}

    for i in range(1, num_records + 1):
        stu = random.choice(student_pool)
        bk = random.choice(BOOKS)
        book_id, book_title, author, category, publisher, pub_year = bk
        book_borrow_counts[book_id] += 1

        # Issue Date
        issue_days = random.randint(0, date_delta)
        issue_dt = start_date + timedelta(days=issue_days)
        
        # Loan period typically 14 days
        loan_period = random.choice([14, 14, 14, 21])
        due_dt = issue_dt + timedelta(days=loan_period)

        # Decide transaction status
        rand_val = random.random()
        if rand_val < 0.68:
            status = "Returned"
            # Return duration: either on time or slightly late
            actual_days = random.choice([7, 10, 12, 14, 15, 17, 22, 28])
            return_dt = issue_dt + timedelta(days=actual_days)
            if return_dt > due_dt:
                overdue_days = (return_dt - due_dt).days
                fine = float(overdue_days * 5)
            else:
                fine = 0.0
            return_date_str = return_dt.strftime("%Y-%m-%d")
        elif rand_val < 0.86:
            status = "Overdue"
            # Return date is not yet returned
            return_date_str = ""
            # Simulated current date snapshot around late Nov 2024
            curr_sim_dt = datetime(2024, 11, 30)
            if curr_sim_dt > due_dt:
                overdue_days = max(1, (curr_sim_dt - due_dt).days)
                fine = float(overdue_days * 5)
            else:
                fine = 25.0
        else:
            status = "Issued"
            return_date_str = ""
            fine = 0.0

        records.append({
            "Transaction_ID": f"TRX-{2024000 + i}",
            "Student_ID": stu["id"],
            "Student_Name": stu["name"],
            "Gender": stu["gender"],
            "Age": stu["age"],
            "Course": stu["course"],
            "Year": stu["year"],
            "Book_ID": book_id,
            "Book_Title": book_title,
            "Author": author,
            "Category": category,
            "Publisher": publisher,
            "Publication_Year": pub_year,
            "Issue_Date": issue_dt.strftime("%Y-%m-%d"),
            "Due_Date": due_dt.strftime("%Y-%m-%d"),
            "Return_Date": return_date_str,
            "Transaction_Status": status,
            "Fine_Amount": fine,
            "Book_Availability": "Available" if status == "Returned" else ("Issued" if random.random() > 0.15 else "Reserved"),
            "Library_Member": stu["member"]
        })

    # Update borrow counts on each record
    for r in records:
        r["Borrow_Count"] = book_borrow_counts[r["Book_ID"]]

    return records

def save_csv():
    records = generate_records(650)
    
    # Save into data/library_data.csv and college-library-analysis/data/library_data.csv
    for dir_path in ["data", "college-library-analysis/data"]:
        os.makedirs(dir_path, exist_ok=True)
        file_path = os.path.join(dir_path, "library_data.csv")
        fieldnames = list(records[0].keys())
        with open(file_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records)
        print(f"Generated {len(records)} records in {file_path}")

if __name__ == "__main__":
    save_csv()
