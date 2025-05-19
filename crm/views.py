from django.shortcuts import render, redirect, get_object_or_404
from portal.models import Application, School, Department, Student, Year, Semester, Headline, Notification, Course, Grade, Lga, State
from django.contrib.auth.decorators import user_passes_test,login_required
from .forms import ApplicationForm, StudentForm, CrmLoginForm, HeadlineForm, NotificationForm, SchoolForm, DepartmentForm, CourseForm, GradeForm
from django.db.models import Count
from django.db.models.expressions import RawSQL
from datetime import datetime
from django.contrib import messages
from django.db.models.functions import ExtractMonth
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.http import JsonResponse
from collections import defaultdict
from django.views.decorators.http import require_GET
from django.db.models.functions import ExtractMonth, ExtractYear
from datetime import datetime, timedelta
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json
from django.utils.timezone import now



# Create your views here.
def Crmlogin(request):
    if request.method == "POST":
        form = CrmLoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password"]

            # Check if a user exists with this email
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                messages.error(request, "User with this email does not exist.")
                return render(request, "crm/login.html", {"form": form})

            # Authenticate user
            user = authenticate(request, username=user.username, password=password)

            if user is not None and user.is_superuser:  # Ensure only superusers can log in
                login(request, user)
                return redirect("dashboard")
            else:
                messages.error(request, "Invalid email or password.")
    else:
        form = CrmLoginForm()

    return render(request, "crm/login.html", {"form": form})

def is_superuser(user):
    """Check if the user is a superuser."""
    return user.is_superuser


@user_passes_test(is_superuser)
@login_required(login_url="crm_login")
def crm_dashboard(request):
    # Dashboard metrics
    total_applications = Application.objects.count()
    total_schools = School.objects.count()
    total_departments = Department.objects.count()
    pending_applications = Application.objects.filter(is_approved=False).count()
    admitted_students = Student.objects.count()
    approved_applications = Application.objects.filter(is_approved=True).count()
    total_pending_application = Application.objects.filter(is_approved=False).count()

    # Applications by month
    applications_by_month = (
        Application.objects.annotate(month=ExtractMonth("created_at"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    # Students by month (approved applications)
    students_by_month = (
        Student.objects.annotate(month=ExtractMonth("created_at"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    # Prepare chart data
    months = []
    application_counts = []
    student_counts = []
    
    # Create a dictionary of month: count for students
    student_data = {item['month']: item['count'] for item in students_by_month}
    
    # Process applications to align months and fill in student counts
    for app in applications_by_month:
        month_num = app['month']
        months.append(datetime.strptime(str(month_num), "%m").strftime("%b"))
        application_counts.append(app['count'])
        student_counts.append(student_data.get(month_num, 0))

    # Recent applications for the table - removed 'user' from select_related
    recent_applications = Application.objects.select_related('school', 'department') \
                                  .order_by("-created_at")[:5]

    context = {
        "total_applications": total_applications,
        "total_schools": total_schools,
        "total_departments": total_departments,
        "pending_applications": pending_applications,
        "admitted_students": admitted_students,
        "recent_applications": recent_applications,
        "months": json.dumps(months),
        "application_counts": json.dumps(application_counts),
        "student_counts": json.dumps(student_counts),
        "approved_applications":approved_applications,
        "total_pending_application": total_pending_application
    }
    return render(request, "crm/dashboard.html", context)

@require_POST
def update_application_status(request, pk):
    try:
        application = get_object_or_404(Application, pk=pk)
        data = json.loads(request.body)
        status = data.get('status')
        
        if status == 'approved':
            application.is_approved = True
            application.save()
            
            # Create student record using available fields
            student = Student.objects.create(
                # Using name fields from Application
                first_name=application.first_name,
                last_name=application.surname,
                # Related fields
                school=application.school,
                department=application.department,
                # Link back to the application
                application=application,
                # Add any other required fields that exist in both models
                # For example:
                state_of_origin=application.state_of_origin,
                local_government=application.local_government,
                academic_session=application.academic_session,
                year=application.year,
                semester=application.semester
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Application approved and student created',
                'student_id': student.id  # Optional: return the new student ID
            })
            
        elif status == 'pending':
            application.is_approved = False
            application.save()
            return JsonResponse({
                'success': True,
                'message': 'Application status set to pending'
            })
            
        return JsonResponse({
            'success': False,
            'message': 'Invalid status'
        }, status=400)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e),
            'error_type': type(e).__name__  # Helps with debugging
        }, status=500)

def chart_data(request):
    # Get range parameter (3, 6, or 12 months)
    range_param = request.GET.get('range', '12')
    try:
        month_range = int(range_param)
    except ValueError:
        month_range = 12
    
    # Validate range
    if month_range not in [3, 6, 12]:
        month_range = 12
    
    # Get current month and year
    current_date = datetime.now()
    current_month = current_date.month
    current_year = current_date.year
    
    # Calculate date range
    if month_range == 12:
        # Full year - get all months
        months_to_show = range(1, 13)
    else:
        # For 3 or 6 months, handle year transition
        months_to_show = [(current_month - i) % 12 or 12 for i in range(month_range-1, -1, -1)]
    
    # Get applications data
    applications = (
        Application.objects
        .annotate(month=ExtractMonth("created_at"), year=ExtractYear("created_at"))
        .filter(
            Q(year=current_year) |
            Q(year=current_year-1, month__gte=months_to_show[0])
        )
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )
    
    # Get students data
    students = (
        Student.objects
        .annotate(month=ExtractMonth("created_at"), year=ExtractYear("created_at"))
        .filter(
            Q(year=current_year) |
            Q(year=current_year-1, month__gte=months_to_show[0])
        )
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )
    
    # Prepare response data
    months = []
    application_counts = []
    student_counts = []
    
    # Create dictionaries for quick lookup
    apps_dict = {item['month']: item['count'] for item in applications}
    students_dict = {item['month']: item['count'] for item in students}
    
    # Generate data for all months in range
    for month_num in months_to_show:
        months.append(datetime.strptime(str(month_num), "%m").strftime("%b"))
        application_counts.append(apps_dict.get(month_num, 0))
        student_counts.append(students_dict.get(month_num, 0))
    
    return JsonResponse({
        'months': months,
        'applications': application_counts,
        'students': student_counts
    })


def search_applications(request):
    query = request.GET.get('q', '').strip()
    if len(query) < 3:
        return JsonResponse({'results': []})
    
    # Search by name fields directly from Application model
    applications = Application.objects.filter(
        Q(first_name__icontains=query) |
        Q(surname__icontains=query) |
        Q(email__icontains=query) |  # Assuming you have an email field
        Q(school__name__icontains=query) |
        Q(department__name__icontains=query) |
        Q(application_number__icontains=query)  # Search by application number
    ).select_related('school', 'department')[:10]  # Limit results
    
    results = [{
        'id': app.id,
        'name': f"{app.first_name} {app.surname}",
        'email': app.email,  # Direct field from Application
        'school': app.school.name if app.school else '',
        'department': app.department.name if app.department else '',
        'status': 'Approved' if app.is_approved else 'Pending',
        'date': app.created_at.strftime("%Y-%m-%d"),
        'application_number': app.application_number  # Include application number
    } for app in applications]
    
    return JsonResponse({'results': results})



def applicant_list(request):
    applications = Application.objects.all()
    total_applications = Application.objects.count()
    total_pending_application = Application.objects.filter(is_approved=False).count()

    # Group applications by school and department
    grouped_applications = {}
    for app in applications:
        school = app.school.name
        department = app.department.name

        if school not in grouped_applications:
            grouped_applications[school] = {}
        if department not in grouped_applications[school]:  # Fixed variable case
            grouped_applications[school][department] = []

        grouped_applications[school][department].append(app)

    return render(request, "crm/applicant_list.html", {"grouped_applications": grouped_applications, 'total_pending_application': total_pending_application, 'total_applications': total_applications})


def pending_list(request):
    pending_applications = Application.objects.filter(is_approved=False)
    total_applications = Application.objects.count()
    total_pending_application = Application.objects.filter(is_approved=False).count()
    # Group applications by school and department
    grouped_applications = {}
    for app in pending_applications:
        school = app.school.name
        department = app.department.name

        if school not in grouped_applications:
            grouped_applications[school] = {}
        if department not in grouped_applications[school]:  # Fixed variable case
            grouped_applications[school][department] = []

        grouped_applications[school][department].append(app)

    return render(request, "crm/pending_list.html", {"grouped_applications": grouped_applications, 'total_pending_application':total_pending_application, 'total_applications': total_applications})

def get_departments(request):
    school_id = request.GET.get('school_id')
    if school_id:
        departments = Department.objects.filter(school_id=school_id)
        department_data = [{'id': dept.id, 'name': dept.name} for dept in departments]
        return JsonResponse(department_data, safe=False)
    return JsonResponse([])

def get_lgas(request):
    state_id = request.GET.get('state_id')
    if state_id:
        lgas = Lga.objects.filter(state_of_origin_id=state_id)
        lga_data = [{'id': lga.id, 'name': lga.name} for lga in lgas]
        return JsonResponse(lga_data, safe=False)
    return JsonResponse([])

def edit_application(request, application_id):
    applicant = get_object_or_404(Application, id=application_id)
    total_applications = Application.objects.count()
    total_pending_application = Application.objects.filter(is_approved=False).count()
    
    if request.method == 'POST':
        form = ApplicationForm(request.POST, request.FILES, instance=applicant)
        if form.is_valid():
            form.save()
            return redirect('view_applicant', application_id=applicant.id)
    else:
        form = ApplicationForm(instance=applicant)
    
    schools = School.objects.all().order_by('name')
    states = State.objects.all().order_by('name')
    
    context = {
        'applicant': applicant,
        'form': form,
        'schools': schools,
        'states': states,
        'total_applications': total_applications,
        'total_pending_application': total_pending_application,
    }
    return render(request, "crm/edit_application.html", context)

def student_list(request):
    students = Student.objects.all()
    total_applications = Application.objects.count()
    total_pending_application = Application.objects.filter(is_approved=False).count()

    # Group students by school and department
    grouped_students = {}
    for student in students:
        school = student.school.name
        department = student.department.name

        if school not in grouped_students:
            grouped_students[school] = {}
        if department not in grouped_students[school]:  # Fixed variable case
            grouped_students[school][department] = []

        grouped_students[school][department].append(student)

    return render(request, "crm/student_list.html", {"grouped_students": grouped_students, 'total_pending_application': total_pending_application, 'total_applications': total_applications})



def edit_student(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    total_applications = Application.objects.count()
    if request.method == "POST":
        form = StudentForm(request.POST, request.FILES, instance=student)
        if form.is_valid():
            form.save()
            return redirect("student_list")  # Redirect to the CRM dashboard or list page
    else:
        form = StudentForm(instance=student)
    
    return render(request, "crm/edit_student.html", {"form": form, "student": student, 'total_applications': total_applications})



def view_applicant(request, application_id):
    applicant = get_object_or_404(Application, id=application_id)
    total_applications = Application.objects.count()
    total_pending_application = Application.objects.filter(is_approved=False).count()
    return render(request, "crm/applicant_profile.html", {"applicant": applicant,'total_pending_application': total_pending_application, 'total_applications': total_applications})



def view_student(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    total_applications = Application.objects.count()
    total_pending_application = Application.objects.filter(is_approved=False).count()
    return render(request, "crm/student_profile.html", {"student": student, 'total_pending_application':total_pending_application, 'total_applications': total_applications})


def generate_matric_number():
    year = now().year
    prefix = "FT"  # Adjust based on program if needed
    count = Student.objects.filter(matric_number__startswith=f"{prefix}{year}").count() + 1
    return f"{prefix}{year}{count:03d}"

def approve_application(request, application_id):
    application = get_object_or_404(Application, id=application_id)

    # Check if a student already exists
    if Student.objects.filter(application_number=application.application_number).exists():
        messages.warning(request, f"Student with application number {application.application_number} already exists!")
        return redirect("applicant_list")

    # ✅ Generate matric number before creating the student
    matric_number = generate_matric_number()

    # Create Student record with matric_number
    student = Student.objects.create(
        application_number=application.application_number,
        matric_number=matric_number,
        surname=application.surname,
        first_name=application.first_name,
        other_name=application.other_name,
        email=application.email,
        phone_number=application.phone_number,
        address=application.address,
        state_of_origin=application.state_of_origin,
        local_government=application.local_government,
        date_of_birth=application.date_of_birth,
        school=application.school,
        department=application.department,
        academic_session=application.academic_session,
        profile_picture=application.profile_picture,
        year=application.year,
        semester=application.semester,
    )

    # Mark application as approved
    application.is_approved = True
    application.save()

    messages.success(request, f"Application {application.application_number} has been approved. Matric number: {matric_number}")
    return redirect("applicant_list")


def revoke_application(request, application_id):
    application = get_object_or_404(Application, id=application_id)

    # Check if a student exists with this application number and delete it
    student = Student.objects.filter(application_number=application.application_number).first()
    if student:
        student.delete()
        print(f"🚨 Student {application.application_number} record deleted.")

    # Mark application as not approved
    application.is_approved = False
    application.save()

    print(f"🚫 Application {application.application_number} has been revoked.")
    return redirect("applicant_list")



def move_to_new_semester(request):
    students = Student.objects.all()
    

    for student in students:
        current_year = student.year
        current_semester = student.semester

        # Get First and Second semester for this year
        first_semester = Semester.objects.filter(name="First", year=current_year).first()
        second_semester = Semester.objects.filter(name="Second", year=current_year).first()

        if not first_semester or not second_semester:
            messages.error(request, f"Error: Year {current_year.number} does not have both semesters!")
            return redirect("dashboard")

        # Move to next semester or next year
        if current_semester == first_semester:
            student.semester = second_semester
        else:
            next_year = Year.objects.filter(number=current_year.number + 1).first()
            if next_year:
                student.year = next_year
                student.semester = Semester.objects.filter(name="First", year=next_year).first()
            else:
                student.status = "Graduated"  # Final year students graduate

        student.save()

    messages.success(request, "All students moved to the new semester successfully!")
    return redirect("semester_success")


def move_semester_confirmationPage(request):
    """Renders the confirmation page before processing the semester update."""
    if request.method == "POST":
        return redirect("move_semester")  # Redirect to the actual move function

    return render(request, "crm/move_confirmation_page.html")


def semester_success(request):
    return render(request, "crm/move_semester_success_page.html")


def move_to_previous_semester(request):
    students = Student.objects.all()

    for student in students:
        current_year = student.year
        current_semester = student.semester

        # Get First and Second semester for this year
        first_semester = Semester.objects.filter(name="First", year=current_year).first()
        second_semester = Semester.objects.filter(name="Second", year=current_year).first()

        if not first_semester or not second_semester:
            messages.error(request, f"Error: Year {current_year.number} does not have both semesters!")
            return redirect("dashboard")

        # Move back to the previous semester or year
        if current_semester == second_semester:
            student.semester = first_semester  # Move back to First Semester
        else:
            prev_year = Year.objects.filter(number=current_year.number - 1).first()
            if prev_year:
                student.year = prev_year
                student.semester = Semester.objects.filter(name="Second", year=prev_year).first()
            else:
                messages.warning(request, f"Student {student} is already in the first semester of the first year and cannot go back further.")

        student.save()

    messages.success(request, "All students moved to the previous semester successfully!")
    return redirect("reverse_semester_success")


def reverse_semester_confirmationPage(request):
    """Renders the confirmation page before processing the semester update."""
    if request.method == "POST":
        return redirect("reverse_semester")  # Redirect to the actual move function

    return render(request, "crm/reverse_comfirmation_page.html")


def semester_reverse_success(request):
    return render(request, "crm/reverse_semester_success.html")



def Notify_student(request):
    total_applications = Application.objects.count()
    total_pending_application = Application.objects.filter(is_approved=False).count()
    if request.method == "POST":
        form = NotificationForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, "Notification Sent successfully!")
            return redirect("Notify_student")
        
    else:
        form = NotificationForm()

    notifications = paginate_notifications(request)

    return render(request, "crm/post_notification.html", {"form":form, "notifications":notifications, 'total_pending_application': total_pending_application, 'total_applications': total_applications})    

def paginate_notifications(request):
    """ Helper function to paginate headlines """
    notification_list = Notification.objects.all()
    paginator = Paginator(notification_list, 3)  # 3 headlines per page
    page_number = request.GET.get("page")
    return paginator.get_page(page_number)



def Post_headline(request):
    total_applications = Application.objects.count()
    total_pending_application = Application.objects.filter(is_approved=False).count()
    if request.method == "POST":
        form = HeadlineForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, "Headline posted successfully!")
            return redirect("Post_headline")
    else:
        form = HeadlineForm()

    # Paginate headlines
    headlines = paginate_headlines(request)

    return render(request, "crm/post_headline.html", {"form": form, "headlines": headlines, 'total_pending_application': total_pending_application, 'total_applications': total_applications})


def paginate_headlines(request):
    """ Helper function to paginate headlines """
    headlines_list = Headline.objects.all().order_by('-created_at')
    paginator = Paginator(headlines_list, 3)  # 3 headlines per page
    page_number = request.GET.get("page")
    return paginator.get_page(page_number)


def Edit_headline(request, headline_id):
    headline = get_object_or_404(Headline, id=headline_id)
    total_applications = Application.objects.count()
    total_pending_application = Application.objects.filter(is_approved=False).count()

    if request.method == "POST":
        form = HeadlineForm(request.POST, request.FILES, instance=headline)
        if form.is_valid():
            form.save()
            messages.success(request, "Headline updated successfully!")
            return redirect("Post_headline")  # Ensure this is correct
    else:
        form = HeadlineForm(instance=headline)


    return render(request, "crm/edit_post.html", {"form": form, "headline": headline, 'total_pending_application': total_pending_application, 'total_applications': total_applications})





def delete_headline(request, headline_id):
    headline = get_object_or_404(Headline, id=headline_id)
    
    if request.user.is_superuser:  # Ensure only superusers can delete
        headline.delete()
        messages.success(request, "Headline deleted successfully!")
    else:
        messages.error(request, "You do not have permission to delete this headline.")
    
    return redirect("Post_headline")  # Redirect to the headline list page

def school_view(request):
    schools = School.objects.all()
    total_applications = Application.objects.count()

    return render(request, 'crm/school_list.html', {'schools':schools, 'total_applications': total_applications})

def add_School(request):
    total_applications = Application.objects.count()
    if request.method == "POST":
        form = SchoolForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, "School created successfully!")
            return redirect("add_school")
    else:
        form = SchoolForm()

    # Paginate headlines
    schools = paginate_schools(request)

    return render(request, "crm/add_school.html", {"form": form, "schools": schools, 'total_applications': total_applications})


def paginate_schools(request):
    """ Helper function to paginate headlines """
    schools_list = School.objects.all()
    paginator = Paginator(schools_list, 3)  # 3 headlines per page
    page_number = request.GET.get("page")
    return paginator.get_page(page_number)


def department_view(request):
    departments = Department.objects.all()
    total_applications = Application.objects.count()

    return render(request, 'crm/department_list.html', {'departments':departments, 'total_applications': total_applications})

def add_department(request):
    total_applications = Application.objects.count()
    if request.method == "POST":
        form = DepartmentForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, "Department created successfully!")
            return redirect("add_department")
    else:
        form = DepartmentForm()

    # Paginate headlines
    departments = paginate_departments(request)

    return render(request, "crm/add_department.html", {"form": form, "departments": departments, 'total_applications': total_applications})

def paginate_departments(request):
    """ Helper function to paginate headlines """
    departments_list = Department.objects.all()
    paginator = Paginator(departments_list, 3)  # 3 headlines per page
    page_number = request.GET.get("page")
    return paginator.get_page(page_number)




def course_view(request):
    courses = Course.objects.all()
    total_applications = Application.objects.count()

    return render(request, 'crm/course_list.html', {'courses':courses, 'total_applications': total_applications})

def add_course(request):
    schools = School.objects.all()
    departments = Department.objects.all()
    semesters = Semester.objects.all().order_by('-year', 'name')
    total_applications = Application.objects.count()
    
    if request.method == "POST":
        form = CourseForm(request.POST, request.FILES)
        if form.is_valid():
            course = form.save()
            messages.success(request, f"Course {course.code} - {course.title} created successfully!")
            return redirect('add_course')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = CourseForm()

    # Get all courses ordered by year and semester
    all_courses = Course.objects.all().order_by('semester__year', 'semester__name', 'code')
    
    # Group courses by year and semester for the dropdown
    courses_by_year_semester = {}
    for course in all_courses:
        year = course.semester.year if course.semester else "Unknown"
        semester_name = course.semester.name if course.semester else "Unknown"
        
        if year not in courses_by_year_semester:
            courses_by_year_semester[year] = {}
        
        if semester_name not in courses_by_year_semester[year]:
            courses_by_year_semester[year][semester_name] = []
        
        courses_by_year_semester[year][semester_name].append(course)
    
    # Paginate the flat course list
    paginator = Paginator(all_courses, 10)
    page_number = request.GET.get('page')
    courses = paginator.get_page(page_number)

    context = {
        "form": form,
        "courses": courses,
        "schools": schools,
        "departments": departments,
        "semesters": semesters,
        "courses_by_year_semester": courses_by_year_semester,
        'total_applications': total_applications,
    }
    return render(request, "crm/add_course.html", context)


def load_departments(request):
    school_id = request.GET.get('school_id')
    departments = Department.objects.filter(school_id=school_id).order_by('name')
    return JsonResponse(list(departments.values('id', 'name')), safe=False)



def add_grade(request):
    # Get all records
    schools = School.objects.all()
    departments = Department.objects.all()
    semesters = Semester.objects.all().order_by('-year', 'name')
    courses = Course.objects.all()
    students = Student.objects.all()
    total_applications = Application.objects.count()

    if request.method == "POST":
        form = GradeForm(request.POST, request.FILES)
        if form.is_valid():
            grade = form.save()
            messages.success(request, f"Grade for {grade.student} in {grade.course} was successfully recorded!")
            return redirect('add_grade')  # Always redirect after successful POST
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = GradeForm()

    context = {
        "form": form,
        "schools": schools,
        "departments": departments,
        "semesters": semesters,
        "courses": courses,
        "students": students,
        'total_applications': total_applications,
    }
    return render(request, "crm/add_grade.html", context)


def edit_grade(request, grade_id):
    grade = get_object_or_404(Grade, id=grade_id)
    total_applications = Application.objects.count()

    if request.method == "POST":
        form = GradeForm(request.POST, request.FILES, instance=grade)
        if form.is_valid():
            updated_grade = form.save()
            messages.success(request, f"{updated_grade.course.title} grade updated successfully!")
            return redirect("grade_list")
    else:
        form = GradeForm(instance=grade)

    return render(request, "crm/edit_grade.html", {"form": form, "grade": grade, 'total_applications': total_applications})


def grade_list(request):
    grades = Grade.objects.select_related('student', 'course', 'semester').order_by('student__surname')
    total_applications = Application.objects.count()
    
    return render(request, 'crm/grade_list.html', {'grades': grades, 'total_applications': total_applications})



def load_courses(request):
    semester_id = request.GET.get('semester_id')
    courses = Course.objects.filter(semester_id=semester_id).order_by('title')
    return JsonResponse(list(courses.values('id', 'title', 'code')), safe=False)


def load_departments(request):
    school_id = request.GET.get('school_id')
    departments = Department.objects.filter(school_id=school_id).order_by('name')
    return JsonResponse(list(departments.values('id', 'name')), safe=False)