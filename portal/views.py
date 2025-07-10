from django.shortcuts import render, redirect, get_object_or_404
from .forms import ApplicationForm, StudentLoginForm, ScreeningForm
from .models import Application, Department, State, Lga, Student, Course, Year, RegisteredCourse, Headline, Category, Notification, TimeTable, PaymentHistory, Screening, School, Semester, AcademicSession  # Ensure you import your model
from django.http import JsonResponse
import json
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import Http404
from .forms import ApplicantLoginForm
from django.views.decorators.http import require_POST
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import uuid
from django.conf import settings
import requests
from django.core.files.base import ContentFile
from django.http import QueryDict
import base64
from datetime import datetime
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

# Create your views here.


@login_required
def pay_acceptance_fees(request):
    student = get_object_or_404(Student, application_number=request.user.username)

    if student.has_paid_acceptance_fee:
        messages.info(request, "You have already paid your acceptance fees.")
        return redirect('portal')

    payment_reference = str(uuid.uuid4())
    request.session['acceptance_fees_payment_reference'] = payment_reference
    request.session['acceptance_fees_amount'] = 100000  # in kobo

    amount_in_naira = 1000.00
    amount_in_kobo = 100000

    # ✅ Combine full name
    student_name = f"{student.surname} {student.first_name} {student.other_name or ''}".strip()

    context = {
        'paystack_public_key': settings.PAYSTACK_PUBLIC_KEY,
        'email': student.email,
        'amount': amount_in_kobo,
        'amount_display': amount_in_naira,
        'reference': payment_reference,
        'callback_url': request.build_absolute_uri(reverse('acceptance_fees_verify_payment')),
        'student_name': student_name,  # ✅ Include this
    }

    return render(request, 'paystack_acceptance_fees.html', context)




@login_required
def acceptance_fees_verify_payment(request):
    reference = request.GET.get('reference')
    session_ref = request.session.get('acceptance_fees_payment_reference')
    expected_amount = request.session.get('acceptance_fees_amount')

    if reference != session_ref:
        messages.error(request, "Invalid payment reference.")
        return redirect('portal')

    url = f'https://api.paystack.co/transaction/verify/{reference}'
    headers = {
        'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
    }
    response = requests.get(url, headers=headers)
    res_data = response.json()

    if res_data['status'] and res_data['data']['status'] == 'success':
        paid_amount = res_data['data']['amount']
        
        if paid_amount != expected_amount:
            messages.error(request, f"Payment amount mismatch. Expected {expected_amount/100}, got {paid_amount/100}")
            return redirect('portal')

        student = get_object_or_404(Student, application_number=request.user.username)

        student.has_paid_acceptance_fee = True
        student.save()

        PaymentHistory.objects.create(
            student=student,
            reference=reference,
            amount=paid_amount,
            status='success',
            payment_type='Acceptance Fees',
            semester=student.semester,
            year=student.year
        )

        del request.session['acceptance_fees_payment_reference']
        del request.session['acceptance_fees_amount']

        messages.success(request, "Acceptance fees payment successful!")
        return redirect('portal')

    messages.error(request, "Payment verification failed.")
    return redirect('portal')




def result_upload(request):
    student = get_object_or_404(Student, application_number=request.user.username)
    screening, created = Screening.objects.get_or_create(student=student)

    # Allow upload only if new or previously declined/pending
    if screening.status == 'approved':
        messages.warning(request, "Your screening has already been approved. You cannot upload new documents.")
        return redirect('portal')  # Or any view you want

    if request.method == "POST":
        form = ScreeningForm(request.POST, request.FILES)
        if form.is_valid():
            ssce_result = form.cleaned_data.get('ssce_result')
            jamb_result = form.cleaned_data.get('jamb_result')

            if ssce_result:
                screening.ssce_result.save(ssce_result.name, ContentFile(ssce_result.read()))
            if jamb_result:
                screening.jamb_result.save(jamb_result.name, ContentFile(jamb_result.read()))

            screening.status = 'pending'  # Reset to pending on new upload
            screening.reviewed_by = None  # Clear reviewer
            screening.review_notes = ''   # Optional: clear previous notes
            screening.save()

            messages.success(request, "Documents uploaded successfully. Awaiting screening decision.")
            return redirect('portal')
    else:
        form = ScreeningForm()

    return render(request, 'result_upload.html', {'form': form, 'student': student})






@login_required
def pay_school_fees(request):
    student = get_object_or_404(Student, application_number=request.user.username)

    if student.has_paid_school_fees:
        messages.info(request, "You have already paid your school fees.")
        return redirect('portal')

    # Generate payment reference
    payment_reference = str(uuid.uuid4())
    request.session['school_fees_payment_reference'] = payment_reference
    request.session['school_fees_amount'] = 100000  # Store amount in kobo in session for verification

    # Amount details (1000 Naira = 100000 kobo)
    amount_in_naira = 1000.00
    amount_in_kobo = 100000

    student_name = f"{student.surname} {student.first_name} {student.other_name or ''}".strip()

    context = {
        'paystack_public_key': settings.PAYSTACK_PUBLIC_KEY,
        'email': student.email,
        'amount': amount_in_kobo,  # Pass amount in kobo to template
        'amount_display': amount_in_naira,  # For display purposes
        'reference': payment_reference,
        'callback_url': request.build_absolute_uri(reverse('school_fees_verify_payment')),
        'student_name': student_name,
    }

    return render(request, 'paystack_school_fees.html', context)

@login_required
def school_fees_verify_payment(request):
    reference = request.GET.get('reference')
    session_ref = request.session.get('school_fees_payment_reference')
    expected_amount = request.session.get('school_fees_amount')  # Amount in kobo

    if reference != session_ref:
        messages.error(request, "Invalid payment reference.")
        return redirect('portal')

    url = f'https://api.paystack.co/transaction/verify/{reference}'
    headers = {
        'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
    }
    response = requests.get(url, headers=headers)
    res_data = response.json()

    if res_data['status'] and res_data['data']['status'] == 'success':
        paid_amount = res_data['data']['amount']

        if paid_amount != expected_amount:
            messages.error(request, f"Payment amount mismatch. Expected {expected_amount/100}, got {paid_amount/100}")
            return redirect('portal')

        student = get_object_or_404(Student, application_number=request.user.username)

        # ✅ Save payment record (without semester)
        PaymentHistory.objects.create(
            student=student,
            reference=reference,
            amount=paid_amount,
            status='success',
            payment_type='School Fees',
            year=student.year,  # ✅ Include academic year only
        )

        # ✅ Update student status
        student.has_paid_school_fees = True
        student.save()

        # ✅ Clear session data
        request.session.pop('school_fees_payment_reference', None)
        request.session.pop('school_fees_amount', None)

        messages.success(request, "School fees payment successful! Matric number will be generated.")
        return redirect('portal')

    messages.error(request, "Payment verification failed.")
    return redirect('portal')


def payment_verify(request):
    reference = request.GET.get('reference')
    session_data = request.session.get('application_form_data')

    if not session_data:
        messages.error(request, "Session expired or invalid. Please refill the form.")
        return redirect('application_create')

    try:
        # Get default Year 1 and First Semester
        year = Year.objects.get(number=1)
        semester = Semester.objects.get(name="First", year=year)
    except Year.DoesNotExist:
        messages.error(request, "Default Year 1 not found. Please set it up in the admin panel.")
        return redirect('application_create')
    except Semester.DoesNotExist:
        messages.error(request, "First Semester for Year 1 not found. Please set it up in the admin panel.")
        return redirect('application_create')

    try:
        application = Application(
            surname=session_data['surname'],
            first_name=session_data['first_name'],
            other_name=session_data.get('other_name'),
            email=session_data['email'],
            phone_number=session_data['phone_number'],
            address=session_data['address'],
            state_of_origin_id=session_data['state_of_origin'],
            local_government_id=session_data['local_government'],
            date_of_birth=session_data['date_of_birth'],
            school_id=session_data['school'],
            department_id=session_data['department'],
            academic_session_id=session_data['academic_session'],
            year=year,
            semester=semester
        )

        # Handle profile picture from session
        profile_picture_content = request.session.get('profile_picture_content')
        profile_picture_name = request.session.get('profile_picture_name')
        if profile_picture_content and profile_picture_name:
            from django.core.files.base import ContentFile
            import base64
            decoded_image = base64.b64decode(profile_picture_content)
            application.profile_picture.save(profile_picture_name, ContentFile(decoded_image), save=False)

        # Save application (this will also generate application number and user)
        application.save()

        messages.success(request, "Payment verified and application submitted successfully.")
        return redirect('application_success', application_number=application.application_number, surname=application.surname)

    except Exception as e:
        messages.error(request, f"An error occurred while saving your application: {str(e)}")
        return redirect('application_create')

def paystack_payment(request):
    form_data = request.session.get('application_form_data')
    payment_reference = request.session.get('payment_reference')
    if not form_data or not payment_reference:
        messages.error(request, "Session expired or invalid access. Please fill the form again.")
        return redirect('application_create')

    context = {
        'paystack_public_key': settings.PAYSTACK_PUBLIC_KEY,
        'email': form_data.get('email'),
        'amount': 50000,  # amount in kobo
        'reference': payment_reference,
        'callback_url': request.build_absolute_uri('/payment_verify/'),
    }
    return render(request, 'paystack_payment.html', context)


@login_required
def payment_history(request):
    student = get_object_or_404(Student, application_number=request.user.username)
    history = student.payment_histories.all()

    selected_year = request.GET.get("year")
    selected_semester = request.GET.get("semester")

    if selected_year:
        try:
            year = Year.objects.get(number=selected_year)
            history = history.filter(year=year)
        except Year.DoesNotExist:
            history = history.none()

    if selected_semester:
        history = history.filter(semester__name__iexact=selected_semester)

    history = history.order_by('-date_paid')

    years = Year.objects.all()[0:4]
    semesters = Semester.objects.all()

    return render(request, 'payment_history.html', {
        'history': history,
        'student': student,
        'years': years,
        'semesters': semesters,
        'selected_year': selected_year,
        'selected_semester': selected_semester,
        'STATIC_URL': settings.STATIC_URL
    })





@login_required
@require_POST
def clear_all_notifications(request):
    try:
        # Delete all notifications for the current user
        deleted_count = Notification.objects.filter(user=request.user).delete()[0]
        
        return JsonResponse({
            'success': True,
            'count': deleted_count
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)



@login_required
@require_POST
def mark_all_notifications_read(request):
    try:
        # Update all unread notifications for the current user
        updated = Notification.objects.filter(
            user=request.user,
            read=False
        ).update(
            read=True,
            read_at=timezone.now()
        )
        
        return JsonResponse({
            'success': True,
            'count': updated
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)




@require_POST
@csrf_exempt  # Only use this if you're having CSRF issues - better to properly handle CSRF
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.read = True
        notification.read_at = timezone.now()
        notification.save()
        return JsonResponse({'success': True})
    except Notification.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Notification not found'}, status=404)

@login_required
@require_POST
def update_profile_picture(request):
    if 'profile_picture' in request.FILES:
        # Handle the file upload here
        return JsonResponse({'success': True})
    return JsonResponse({'success': False}, status=400)


def applicant_login(request):
    if request.method == "POST":
        form = ApplicantLoginForm(request.POST)
        if form.is_valid():
            application_number = form.cleaned_data["application_number"]
            surname = form.cleaned_data["surname"]

            

            # Authenticate using the application number as username
            user = authenticate(request, username=application_number, password=surname)
            
            if user:
                login(request, user)
                return redirect("applicant_profile")  # Redirect to profile page
            else:
                return render(request, "applicant_login.html", {"form": form, "error": "Invalid application number or surname."})
    else:
        form = ApplicantLoginForm()

    return render(request, "applicant_login.html", {"form": form})


def student_login(request):
    if request.method == "POST":
        form = StudentLoginForm(request.POST)
        if form.is_valid():
            application_number = form.cleaned_data["application_number"]
            surname = form.cleaned_data["surname"]

            # Authenticate using application number as username
            user = authenticate(request, username=application_number, password=surname)
            
            if user:
                login(request, user)
                return redirect("portal")  # Redirect to student profile
            else:
                return render(request, "student_login.html", {
                    "form": form,
                    "error": "Invalid application number or surname."
                })
    else:
        form = StudentLoginForm()

    return render(request, "student_login.html", {"form": form})




def home(request):
    return render(request, 'home.html')




@login_required
def applicant_profile(request):
    user = request.user  # Get the logged-in users
    applications = Application.objects.filter(application_number=user.username)  # Fetch their application
    students = Student.objects.filter(application_number=user.username).first()
    screening = Screening.objects.filter(student=students).first()

    if students:
        
        return redirect("admission_success", students.application_number, students.surname )

    return render(request, "applicant_profile.html", {"applications": applications, "students": students, "screening": screening})



@login_required(login_url="portal")
def student_portal(request):
    user = request.user
    student = Student.objects.filter(application_number=user.username).first()
    screening = Screening.objects.filter(student=student).first()

    if not student:
        return render(request, "error.html", {"message": "Student profile not found."})

    notifications = Notification.objects.all()
    department = student.department

    timetables = TimeTable.objects.filter(
        department=student.department,
        semester=student.semester
    )

    last_semester = student.get_last_semester()
    last_gpa = student.calculate_gpa_for_semester(last_semester) if last_semester else None

    registered_courses = RegisteredCourse.objects.filter(
        student=student,
        semester=student.semester
    ).select_related('course')

    total_units = sum(reg_course.course.unit for reg_course in registered_courses)
    total_course = registered_courses.count()
    units_remaining = 24 - total_units if total_units <= 24 else 0

    context = {
        'student': student,
        'total_course': total_course,
        'screening': screening,
        'screening_status': screening.status if screening else None,
        'total_unit': total_units,
        'units_remaining': units_remaining,
        'registered_courses': registered_courses,
        'notifications': notifications,
        'timetables': timetables,
        'department': department,
        'last_gpa': last_gpa,
        'last_semester': last_semester,
        'update_profile_picture_url': reverse('update_profile_picture'),
        'upcoming_deadlines': [],  # Add your deadlines logic here
        'recent_announcements': [],  # Add your announcements logic here
    }

    return render(request, "portal.html", context)


def student_biodata(request):
    user = request.user  # Get the logged-in user
    student = Student.objects.filter(application_number=user.username).first()
    screening = Screening.objects.filter(student=student).first()

    context = {
        'screening_status': screening.status if screening else None,
        "student": student,
        "screening": screening,
    }

    try:
        student = Student.objects.get(application_number=user.username)
    except Student.DoesNotExist:
        student = None  # If student is not found, avoid errors

    return render(request, "biodata.html", context )


@login_required
def CourseRegistration(request):
    student = Student.objects.filter(application_number=request.user.username).first()
    screening = Screening.objects.filter(student=student).first()
    courses = Course.objects.filter(department=student.department, semester=student.semester)
    

    context = {

        'screening_status': screening.status if screening else None,
        "courses": courses,
        "student": student,
        "screening": screening,
    }
    if not student:
        return redirect('portal')  # or raise 404

    courses = Course.objects.filter(department=student.department, semester=student.semester)
    return render(request, 'course_registration.html', context)

@login_required
def submit_registration(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            course_ids = data.get("courses", [])
            student = Student.objects.get(application_number=request.user.username)

            for course_id in course_ids:
                course = Course.objects.get(id=course_id)
                RegisteredCourse.objects.get_or_create(
                    student=student,
                    course=course,
                    semester=student.semester
                )

            return JsonResponse({"success": True, "message": "Courses registered successfully!"})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})

    return JsonResponse({"success": False, "message": "Invalid request method."})


def registered_courses(request):
    user = request.user
    student = Student.objects.filter(application_number=user.username).first()
    screening = Screening.objects.filter(student=student).first()
    
    if not student:
        return render(request, "error.html", {"message": "Student profile not found."})

    registered_courses = RegisteredCourse.objects.filter(
    student=student,
    semester=student.semester
)


    return render(request, "registered_courses.html", {
        "registered_courses": registered_courses,
        "student": student,
        "screening": screening,
        'screening_status': screening.status if screening else None,
    })

def headline_news(request):
    headlines = Headline.objects.all()
    return render(request, "news.html", {"headlines": headlines})



def application_create_view(request):
    if request.method == 'POST':
        form = ApplicationForm(request.POST, request.FILES)
        if form.is_valid():
            cleaned = form.cleaned_data

            form_data = {
                'surname': cleaned['surname'],
                'first_name': cleaned['first_name'],
                'other_name': cleaned.get('other_name', ''),
                'email': cleaned['email'],
                'phone_number': cleaned['phone_number'],
                'address': cleaned['address'],
                'date_of_birth': cleaned['date_of_birth'].strftime('%Y-%m-%d') if cleaned.get('date_of_birth') else '',
                'state_of_origin': cleaned['state_of_origin'].id if cleaned.get('state_of_origin') else None,
                'local_government': cleaned['local_government'].id if cleaned.get('local_government') else None,
                'school': cleaned['school'].id if cleaned.get('school') else None,
                'department': cleaned['department'].id if cleaned.get('department') else None,
                'academic_session': cleaned['academic_session'].id if cleaned.get('academic_session') else None,
                'year': cleaned['year'].id if cleaned.get('year') else None,
                'semester': cleaned['semester'].id if cleaned.get('semester') else None,
            }

            request.session['application_form_data'] = form_data

            # Save profile picture to session
            profile_picture = request.FILES.get('profile_picture')
            if profile_picture:
                request.session['profile_picture_name'] = profile_picture.name
                request.session['profile_picture_content'] = base64.b64encode(profile_picture.read()).decode('utf-8')

            # Payment reference
            payment_reference = str(uuid.uuid4())
            request.session['payment_reference'] = payment_reference

            return redirect('paystack_payment')
        else:
            messages.error(request, "Form is invalid. Please correct the highlighted fields.")
    else:
        form = ApplicationForm()

    return render(request, 'application_form.html', {'form': form})



def get_departments(request):
    school_id = request.GET.get('school_id')
    departments = Department.objects.filter(school_id=school_id).values('id', 'name')
    return JsonResponse({'departments': list(departments)})

def get_lgas(request):
    # Get the state_id from the request
    state_id = request.GET.get('state_id')
    
    if state_id:
        # Filter LGAs by the selected state
        lgas = Lga.objects.filter(state_of_origin_id=state_id)
    else:
        lgas = Lga.objects.none()  # Return no LGAs if no state is selected

    # Prepare the response with LGA data
    lga_list = [{'id': lga.id, 'name': lga.name} for lga in lgas]
    
    return JsonResponse({'lgas': lga_list})


def application_success(request, application_number, surname):
    return render(request, 'application_success.html', {
        'application_number': application_number,
        'surname': surname
    })

def admission_success(request, application_number, surname):
    return render(request, 'admission_success.html', {
        'application_number': application_number,
        'surname': surname
    })


def Notification_Page(request):
    user = request.user
    notifications = Notification.objects.all()
    student = Student.objects.filter(application_number=user.username).first()
    screening = Screening.objects.filter(student=student).first()

    context = {
        'notifications':notifications, 
        'student':student, 
        'screening': Screening,
        'screening_status': screening.status if screening else None,
    }

    return render(request, 'notification.html', context)

@require_http_methods(["GET", "POST"])
def View_Notification(request, Notification_id):
    user = request.user
    student = Student.objects.filter(application_number=user.username).first()
    notification = get_object_or_404(Notification, id=Notification_id)
    screening = Screening.objects.filter(student=student).first()

    # Handle POST request to mark as read
    if request.method == 'POST':
        if not notification.read:
            notification.read = True
            notification.read_at = timezone.now()
            notification.save()
        return JsonResponse({'success': True})

    # Handle GET request (normal page load)
    return render(request, 'notification_page.html', {
        'notification': notification,
        'student': student, "screening": screening,'screening_status': screening.status if screening else None,
    })


def online_status(request):
    return JsonResponse({'status': 'online'})