from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password
from django.utils.timezone import now
from multiselectfield import MultiSelectField
from django.utils import timezone
from django.utils.timezone import now

# ------------------ CATEGORY MODEL ------------------



class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# ------------------ YEAR & SEMESTER MODELS ------------------
class Year(models.Model):
    number = models.IntegerField(unique=True)  # Example: 1, 2, 3, 4
    name = models.CharField(max_length=50, default="")

    def __str__(self):
        return f"Year {self.number}"

class Semester(models.Model):
    name = models.CharField(max_length=20)  # "First" or "Second"
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name="semesters")

    class Meta:
        unique_together = ("name", "year")  # Ensure each year has only one "First" & "Second"

    def __str__(self):
        return f"{self.year} - {self.name} Semester"

# ------------------ SCHOOL & DEPARTMENT MODELS ------------------
class School(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Department(models.Model):
    name = models.CharField(max_length=100)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="departments")

    def __str__(self):
        return self.name
    
class Lecturer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=11, blank=True, null=True)
    office_location = models.CharField(max_length=100, blank=True, null=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="lecturers")
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="lecturers")

    def __str__(self):
        return self.name    
    
class TimeTable(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="timetables")
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name="timetables")
    file = models.FileField(upload_to="timetables/", blank=True, null=True)

    class Meta:
        unique_together = ("department", "semester")
    def save(self, *args, **kwargs):
        if not self.file:
            raise ValueError("File cannot be empty")
        super().save(*args, **kwargs)   

    def __str__(self):
        return f"{self.semester.name} semester timetable for {self.department.name}"    

# ------------------ COURSE MODELS ------------------
class Course(models.Model):
    DAYS_OF_WEEK = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
    ]

    TIME_SLOTS = [
        ('08:00AM', '08:00 AM'),
        ('09:00AM', '09:00 AM'),
        ('10:00AM', '10:00 AM'),
        ('11:00AM', '11:00 AM'),
        ('12:00PM', '12:00 PM'),
        ('13:00PM', '01:00 PM'),
        ('14:00PM', '02:00 PM'),
        ('15:00PM', '03:00 PM'),
        ('16:00PM', '04:00 PM'),
        ('17:00PM', '05:00 PM'),
    ]

    title = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    unit = models.IntegerField()
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="courses")
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="courses")
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name="courses")
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE, blank=True, null=True)
    days = MultiSelectField(choices=DAYS_OF_WEEK, blank=True, null=True)
    time = models.CharField(max_length=10, choices=TIME_SLOTS, blank=True, null=True)
    venue = models.CharField(max_length=100, blank=True, null=True)
    syllabus = models.FileField(upload_to="syllabus/", blank=True, null=True)

    def __str__(self):
        return self.title



class RegisteredCourse(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    date_registered = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.surname} - {self.course.title}"

# ------------------ STATE & LGA MODELS ------------------
class State(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Lga(models.Model):
    name = models.CharField(max_length=100)
    state_of_origin = models.ForeignKey(State, on_delete=models.CASCADE, related_name="lgas")

    def __str__(self):
        return self.name

# ------------------ HELPER FUNCTION ------------------
def get_default_semester():
    return Semester.objects.first()  # Returns `None` if no semester exists

# ------------------ ACADEMIC SESSION MODEL ------------------
class AcademicSession(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["-id"]  # Orders by newest first

    def __str__(self):
        return self.name

# ------------------ APPLICATION MODEL ------------------
class Application(models.Model):
    surname = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    other_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=11)
    address = models.CharField(max_length=100)
    state_of_origin = models.ForeignKey(State, on_delete=models.CASCADE)
    local_government = models.ForeignKey(Lga, on_delete=models.CASCADE)
    date_of_birth = models.DateField()
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    application_number = models.CharField(max_length=10, unique=True, blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", 
        blank=True, 
        null=True, 
        default="default-profile.png")
    created_at = models.DateTimeField(default=now, editable=True)
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE, related_name="applications")
    is_approved = models.BooleanField(default=False)
    year = models.ForeignKey(Year, default=1, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, default=get_default_semester)

    def save(self, *args, **kwargs):
        if not self.application_number:
            count = Application.objects.count() + 1
            self.application_number = f"A2025{count:03d}"
            count = Application.objects.count() + 1
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.application_number} - {self.surname} {self.first_name}"    

    def approve(self):
        """Transfers application data to Student model upon approval."""
        student = Student.objects.create(
            surname=self.surname,
            first_name=self.first_name,
            other_name=self.other_name,
            email=self.email,
            phone_number=self.phone_number,
            address=self.address,
            state_of_origin=self.state_of_origin,
            local_government=self.local_government,
            date_of_birth=self.date_of_birth,
            school=self.school,
            department=self.department,
            application_number=self.application_number,
            profile_picture=self.profile_picture,
            academic_session=self.academic_session,
            year=self.year,
            semester=self.semester,
            
        )


# ------------------ STUDENT MODEL ------------------
class Student(models.Model):
    surname = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    other_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=11)
    address = models.CharField(max_length=100)
    state_of_origin = models.ForeignKey('State', on_delete=models.CASCADE)
    local_government = models.ForeignKey('Lga', on_delete=models.CASCADE)
    date_of_birth = models.DateField()
    school = models.ForeignKey('School', on_delete=models.CASCADE)
    department = models.ForeignKey('Department', on_delete=models.CASCADE)
    application_number = models.CharField(max_length=10, unique=True, blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", 
        blank=True, 
        null=True, 
        default="default-profile.png"
    )
    academic_session = models.ForeignKey('AcademicSession', on_delete=models.CASCADE, related_name="students")
    created_at = models.DateTimeField(default=now, editable=True)
    year = models.ForeignKey('Year', on_delete=models.CASCADE)
    semester = models.ForeignKey('Semester', null=True, blank=True, on_delete=models.SET_NULL)
    has_paid_school_fees = models.BooleanField(default=False)
    has_paid_acceptance_fee = models.BooleanField(default=False)
    matric_number = models.CharField(max_length=20, unique=True, blank=True, null=True)

    def generate_matric_number(self):
        if self.has_paid_school_fees and not self.matric_number:
            base = "FISHER"
            dept_code = getattr(self.department, "code", str(self.department.id))
            session_code = getattr(self.academic_session, "year", str(self.academic_session.id))
            count = Student.objects.filter(department=self.department, academic_session=self.academic_session).count() + 1

            while True:
                number = f"{base}-{dept_code}-{session_code}-{count:04d}"
                if not Student.objects.filter(matric_number=number).exists():
                    self.matric_number = number
                    break
                count += 1

    def save(self, *args, **kwargs):
        self.generate_matric_number()
        super().save(*args, **kwargs)

    def calculate_cgpa(self):
        grades = self.grades.filter(course__semester__year=self.year) 
        total_qp = 0
        total_units = 0
        for grade in grades:
            gp = grade.get_grade_point()
            cu = grade.course.unit
            total_qp += gp * cu
            total_units += cu
        return round(total_qp / total_units, 2) if total_units else 0.0
    
    def calculate_gpa(self):
        grades = self.grades.filter(semester=self.semester)
        total_qp = 0
        total_units = 0
        for grade in grades:
            gp = grade.get_grade_point()
            cu = grade.course.unit
            total_qp += gp * cu
            total_units += cu
        return round(total_qp / total_units, 2) if total_units else 0.0
    
    def get_last_semester(self):
        try:
            semesters = Semester.objects.order_by('year__number', 'name')
            current_index = list(semesters).index(self.semester)
            return semesters[current_index - 1] if current_index > 0 else None
        except:
            return None

    def calculate_gpa_for_semester(self, semester):
        grades = self.grades.filter(semester=semester)
        total_qp = 0
        total_units = 0
        for grade in grades:
            gp = grade.get_grade_point()
            cu = grade.course.unit
            total_qp += gp * cu
            total_units += cu
        return round(total_qp / total_units, 2) if total_units else 0.0

    def __str__(self):
        return f"{self.matric_number} ({self.surname}) ({self.first_name})"


class PaymentHistory(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('School Fees', 'School Fees'),
        ('Acceptance Fees', 'Acceptance Fees'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payment_histories')
    semester = models.ForeignKey(Semester, on_delete=models.SET_NULL, null=True, blank=True)

    reference = models.CharField(max_length=100, unique=True)
    amount = models.PositiveIntegerField(help_text="Amount in kobo")
    status = models.CharField(max_length=20, default='success')
    date_paid = models.DateTimeField(default=timezone.now)
    payment_type = models.CharField(
        max_length=50,
        choices=PAYMENT_TYPE_CHOICES,
        default='School Fees'
    )
    year = models.ForeignKey(Year, on_delete=models.CASCADE)  # ✅ New field

    def amount_display(self):
        return self.amount / 100

    def __str__(self):
        return f"{self.student.application_number} - {self.payment_type} - ₦{self.amount_display():,.2f}"



# models.py
class Screening(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
    ]
    
    ssce_result = models.FileField(upload_to="ssce_results/", blank=True, null=True)
    jamb_result = models.FileField(upload_to="jamb_results/", blank=True, null=True)
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='screening')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    review_notes = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Screening for {self.student.application_number} - {self.student.surname} {self.student.first_name}"
    
    @property
    def passed_screening(self):
        """Backward compatibility with old boolean field"""
        return self.status == 'approved'


# ------------------ GRADE MODEL ------------------
class Grade(models.Model):
    GRADE_CHOICES = [
        ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D'), ('E', 'E'), ('F', 'F')
    ]
    GRADE_POINTS = {
        'A': 5.0,
        'B': 4.0,
        'C': 3.0,
        'D': 2.0,
        'E': 1.0,
        'F': 0.0,
    }

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    grade = models.CharField(max_length=1, choices=GRADE_CHOICES)

    class Meta:
        unique_together = ('student', 'course')

    def get_grade_point(self):
        return self.GRADE_POINTS.get(self.grade, 0.0)

    def __str__(self):
        return f"{self.student.application_number} - {self.course.code}: {self.grade}"

# ------------------ HEADLINE MODEL ------------------
class Headline(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    image = models.ImageField(upload_to="news_images/", blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=now, editable=True)

    def __str__(self):
        return self.title

# ------------------ NOTIFICATION MODEL ------------------
class Notification(models.Model):
    title = models.CharField(max_length=100)
    message = models.CharField(max_length=10000)
    created_at = models.DateTimeField(default=now, editable=True)

    def __str__(self):
        return self.title

# ------------------ SIGNAL HANDLERS ------------------
@receiver(post_save, sender=Application)
def create_application_user(sender, instance, created, **kwargs):
    if created:
        User.objects.get_or_create(
            username=instance.application_number,
            defaults={
                "first_name": instance.first_name,
                "last_name": instance.surname,
                "password": make_password(instance.surname),
            }
        )