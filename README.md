# 🏫 School Management System

A Django-based school portal for managing applications, student admissions, staff records, course registration, screening, payments, and more.

---

## 🚀 Features

- application with automatic application number generation
- Applicant login using application number and surname
- Payment integration (Paystack-ready)
- Admin CRM for reviewing and approving applications
- Document upload and screening approval
- School fee payment, course registration, grading, session and semester switching
- Staff management, timetable creation, academic sessions

---

## 🧰 Requirements

- Python 3.8+
- pip
- virtualenv (recommended)
- SQLite or PostgreSQL
- Git

---

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/adelana107/School-management-system.git
cd School-management-system
```

### 2. Create and Activate Virtual Environment

```bash
python -m venv venv
# Activate:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. import the STATE and LGA

```bash [depends on where your excel sheet is located]
python manage.py import_states_lgas "C:\Users\Adela\Desktop\School-management-system\states_lgas.csv"
```

### 7. Run the Server

```bash
python manage.py runserver
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## 🌐 URL Structure & Navigation

### 🔓 Applicant URLs

| URL         | Purpose                                        |
| ----------- | ---------------------------------------------- |
| `/`         | Home page                                      |
| `/apply/`   | Fill application form                          |
| `/login/`   | Applicant login (Application Number + Surname) |
| `/profile/` | View application profile                       |
| `/payment/` | Application payment page                       |

### 🔐 CRM (Superuser Only)

| URL                  | Purpose                            |
| -------------------- | ---------------------------------- |
| `/crm/dashboard`     | CRM dashboard                      |
| `/crm/login/`        | Superuser login (Email + Password) |
| `/crm/applications/` | View & approve applications        |
| `/crm/students/`     | Manage student records             |
| `/crm/screening/`    | Screen uploaded documents          |
| `/crm/courses/`      | Create and manage courses          |
| `/crm/staff/`        | Add/manage staff                   |
| `/crm/grades/`       | Assign grades                      |
| `/crm/timetable/`    | Create class timetable             |
| `/crm/quick-action/` | Move to next semester/session      |

### ⚙️ Django Admin

| URL       | Purpose                                |
| --------- | -------------------------------------- |
| `/admin/` | Django admin backend (superusers only) |

---

## 📚 Application & Admission Workflow

### 🧑‍🎓 For Applicants:

1. Go to `/apply/` and fill the application form.
2. Click **Submit** to save your application.
3. Proceed to **make payment** to complete submission.
4. To check application status, go to **Applicant Login** using your Application Number and Surname.

---

### 👨‍💼 For Admin (CRM Superusers):

#### ✅ Approve Applications:

1. Login to the **CRM** via `/crm/login/`.
2. Go to **Pending Applications** and click **Approve** on reviewed entries.

#### 🎓 Student Portal Actions:

1. Once approved, the applicant becomes a student and logs in to the Student Portal.
2. From **Quick Actions**:

   - Pay **Acceptance Fee**
   - Upload **Documents** for screening

#### 🔍 Screening Documents:

1. Go to **CRM → Screening** to review uploaded documents.
2. Admin can:

   - **Approve**: Grants student access to school fee payment.
   - **Reject**: Student is notified and can re-upload corrected documents.

#### 💰 After Screening:

1. Once approved, student visits **Action Required** in the portal to:

   - Pay **School Fees**
   - **Register Courses** (only available if Admin has created courses)

#### 🔄 Semester & Session Management:

- Use **CRM → Quick Actions** to:

  - Move to next semester
  - Move to next academic session

#### 📊 Grading & Timetable:

- **Assign grades** via CRM.
- **Create timetable** from the CRM Timetable section.

---

## 📁 Project Structure

```bash
School-management-system/
├── portal/             # Applicant & Student logic
├── crm/                # Admin dashboard (CRM)
├── templates/          # HTML templates
├── static/             # Static files (CSS/JS)
├── media/              # Uploaded documents
├── manage.py
├── requirements.txt
└── README.md
```

---

## 🛠 Tech Stack

- Django (Backend Framework)
- SQLite or PostgreSQL (Database)
- Bootstrap (UI)
- Stripe/Paystack (Payment)
- HTML templates (frontend)
- Python 3.8+

---

## 👨‍💼 Superuser Login

Create a superuser with:

```bash
python manage.py createsuperuser
```

Use it to access both:

- `/crm/` (Custom CRM)
- `/admin/` (Django Admin)

---

## 📌 Notes

- Applicants log in with **Application Number** and **Surname**.
- if given admission and school fees as been paid, students log in with **Matric Number** and **Surname**

- CRM access is **restricted to superusers**.
- Application numbers are auto-generated (e.g., `A2025001`).
- Course registration is only available if admin has created courses from CRM.

---

## 📞 Contact

For questions or contributions, reach out via GitHub: [adelana107](https://github.com/adelana107).
