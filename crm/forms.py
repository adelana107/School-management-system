from django import forms
from django.contrib.auth.models import User, Group
from portal.models import StaffProfile
from portal.models import Application, Department, School, State, Lga, Student, Headline, Category, Notification, Course, Grade, Semester, TimeTable
from django.core.exceptions import ValidationError




class StaffCreationForm(forms.Form):
    username = forms.CharField(label="Username")
    email = forms.EmailField(label="Email")
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirm Password", widget=forms.PasswordInput)
    school = forms.ModelChoiceField(queryset=School.objects.all(), label="School")
    department = forms.ModelChoiceField(queryset=Department.objects.all(), label="Department")
    group = forms.ModelChoiceField(queryset=Group.objects.all(), label="Assign Group")

    def clean_username(self):
        username = self.cleaned_data.get("username")
        if User.objects.filter(username=username).exists():
            raise ValidationError("This username is already taken. Choose another one.")
        return username

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords do not match.")
        return cleaned_data

    def save(self):
        user = User.objects.create_user(
            username=self.cleaned_data["username"],
            email=self.cleaned_data["email"],
            password=self.cleaned_data["password1"]
        )

        user.is_staff = True  # ✅ Give staff access
        user.is_active = True  # ✅ Ensure the user is active
        user.save()

        group = self.cleaned_data["group"]
        user.groups.add(group)

        school = self.cleaned_data["school"]
        department = self.cleaned_data["department"]

        StaffProfile.objects.create(
            user=user,
            school=school,
            department=department
        )

        return user




class ApplicationForm(forms.ModelForm):

    class Meta:
        model = Application
        fields = [
            'surname', 'first_name', 'other_name', 'email', 'phone_number', 
            'address', 'state_of_origin', 'local_government', 
            'date_of_birth', 'school', 'department', 'profile_picture'
        ]
        widgets = {
            'date_of_birth': forms.DateInput(attrs={
                'type': 'date', 
                'class': 'form-control',
                'placeholder': 'YYYY-MM-DD'
            }),
            'school': forms.Select(attrs={
                'class': 'form-select',
                'data-placeholder': 'Select a school'
            }),
            'department': forms.Select(attrs={
                'class': 'form-select',
                'data-placeholder': 'Select a department'
            }),
            'state_of_origin': forms.Select(attrs={
                'class': 'form-select',
                'data-placeholder': 'Select a state'
            }),
            'local_government': forms.Select(attrs={
                'class': 'form-select',
                'data-placeholder': 'Select a local government'
            }),
            'profile_picture': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Apply Bootstrap styling and placeholders
        for field_name, field in self.fields.items():
            if field_name not in ['gender', 'marital_status']:
                field.widget.attrs['class'] = field.widget.attrs.get('class', 'form-control')
            
            if isinstance(field.widget, (forms.TextInput, forms.EmailInput, forms.NumberInput)):
                field.widget.attrs['placeholder'] = field.widget.attrs.get('placeholder', field.label)

        # For department and local_government fields, we'll handle these in JavaScript
        # to allow proper selection in the edit form
        self.fields['department'].empty_label = '---------'
        self.fields['local_government'].empty_label = '---------'
        
        # Make sure all Departments and LGAs are available to be selected
        # This prevents validation errors during form submission
        self.fields['department'].queryset = Department.objects.all().order_by('name')
        self.fields['local_government'].queryset = Lga.objects.all().order_by('name')

    def clean_department(self):
        department = self.cleaned_data.get('department')
        school = self.cleaned_data.get('school')
        
        if department and school:
            # Verify department belongs to selected school
            if department.school_id != school.id:
                raise forms.ValidationError("Selected department doesn't belong to the selected school.")
        elif department and not school:
            raise forms.ValidationError("Please select a school first.")
        
        return department

    def clean_local_government(self):
        lga = self.cleaned_data.get('local_government')
        state = self.cleaned_data.get('state_of_origin')
        
        if lga and state:
            # Verify LGA belongs to selected state
            if lga.state_of_origin_id != state.id:
                raise forms.ValidationError("Selected local government doesn't belong to the selected state.")
        elif lga and not state:
            raise forms.ValidationError("Please select a state first.")
            
        return lga

    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        if phone_number:
            if not phone_number.isdigit():
                raise forms.ValidationError("Phone number must contain only digits.")
            if len(phone_number) != 11:
                raise forms.ValidationError("Phone number must be 11 digits.")
        return phone_number

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email and Application.objects.filter(email=email).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise forms.ValidationError("This email is already in use.")
        return email

    def clean_profile_picture(self):
        profile_picture = self.cleaned_data.get('profile_picture')
        if profile_picture:
            if profile_picture.size > 2 * 1024 * 1024:  # 2MB limit
                raise forms.ValidationError("Profile picture size should not exceed 2MB.")
            if not profile_picture.name.lower().endswith(('.jpg', '.jpeg', '.png')):
                raise forms.ValidationError("Only JPG, JPEG or PNG files are allowed.")
        return profile_picture

    def clean(self):
        cleaned_data = super().clean()
        
        # Make validation warnings more helpful
        if cleaned_data.get('school') and not cleaned_data.get('department'):
            self.add_error('department', 'Please select a department for the chosen school')
        
        if cleaned_data.get('state_of_origin') and not cleaned_data.get('local_government'):
            self.add_error('local_government', 'Please select a local government for the chosen state')
        
        return cleaned_data

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = [
            'surname', 'first_name', 'other_name', 'email', 'phone_number', 
            'address', 'state_of_origin', 'local_government', 
            'date_of_birth', 'school', 'department', 'profile_picture'
        ]
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'school': forms.Select(attrs={'class': 'form-select'}),
            'department': forms.Select(attrs={'class': 'form-select'}),
            'state_of_origin': forms.Select(attrs={'class': 'form-select', 'id': 'id_state_of_origin'}),
            'local_government': forms.Select(attrs={'class': 'form-select', 'id': 'id_local_government'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Apply Bootstrap styling to all fields
        for field in self.fields:
            self.fields[field].widget.attrs.update({"class": "form-control"})

        # Initialize course queryset
        self.fields['department'].queryset = Department.objects.none()
        self.fields['local_government'].queryset = Lga.objects.none()

        # If form is being edited and already has data
        if self.instance.pk:
            if self.instance.school:
                self.fields['department'].queryset = Department.objects.filter(school=self.instance.school)
            
            if self.instance.state_of_origin:
                self.fields['local_government'].queryset = Lga.objects.filter(state_of_origin=self.instance.state_of_origin)

        # If form is being submitted and has data
        if 'school' in self.data:
            try:
                school_id = int(self.data.get('school'))
                self.fields['department'].queryset = Department.objects.filter(school_id=school_id)
            except (ValueError, TypeError):
                pass

        if 'state_of_origin' in self.data:
            try:
                state_id = int(self.data.get('state_of_origin'))
                self.fields['local_government'].queryset = Lga.objects.filter(state_of_origin_id=state_id)
            except (ValueError, TypeError):
                pass            



class CrmLoginForm(forms.Form):
    email = forms.CharField(label="Email", max_length=20)
    password = forms.CharField(label="Password", widget=forms.PasswordInput)


class HeadlineForm(forms.ModelForm):
    class Meta:
        model = Headline
        fields = ["title", "content", "image", "category"]
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control", "placeholder": "Enter headline title"}),
            "content": forms.Textarea(attrs={"class": "form-control", "rows": 5, "placeholder": "Enter headline content"}),
            "image": forms.FileInput(attrs={"class": "form-control"}),
            "category": forms.Select(attrs={"class": "form-select"}),
        }

class NotificationForm(forms.ModelForm):
    class Meta:
        model = Notification
        fields = ["title", "message"]
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control", "placeholder": "Enter notification title"}),
            "message": forms.Textarea(attrs={"class": "form-control", "rows": 5, "placeholder": "Enter notification content"}),
           
        }


class SchoolForm(forms.ModelForm):
    class Meta:
        model = School
        fields = ["name"]  # Changed from "Name" to "name" to match model field
        widgets = {
            "name": forms.TextInput(attrs={
                "class": "form-control", 
                "placeholder": "Enter school name"
            }),
        }

class DepartmentForm(forms.ModelForm):
    class Meta:
        model = Department
        fields = ["name", "school"]
        widgets = {
            "name": forms.TextInput(attrs={
                "class": "form-control", 
                "placeholder": "Enter department name"  # Changed from "school name" to be more accurate
            }),
            "school": forms.Select(attrs={  # Changed to Select since school is likely a ForeignKey
                "class": "form-control",
                "placeholder": "Select school"
            }),
        }

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set initial empty queryset for department if no school is selected
        if 'school' in self.data:
            try:
                school_id = int(self.data.get('school'))
                self.fields['department'].queryset = Department.objects.filter(school_id=school_id).order_by('name')
            except (ValueError, TypeError):
                pass
        elif self.instance.pk:
            self.fields['department'].queryset = self.instance.school.department_set.order_by('name')
        else:
            self.fields['department'].queryset = Department.objects.none()


class GradeForm(forms.ModelForm):
    class Meta:
        model = Grade
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['course'].queryset = Course.objects.none()

        if 'semester' in self.data:
            try:
                semester_id = int(self.data.get('semester'))
                self.fields['course'].queryset = Course.objects.filter(semester_id=semester_id).order_by('title')
            except (ValueError, TypeError):
                pass
        elif self.instance.pk:
            self.fields['course'].queryset = self.instance.semester.courses.order_by('title')


class TimeTableForm(forms.ModelForm):
    class Meta:
        model = TimeTable
        fields = ['department', 'semester', 'file']
        widgets = {
            'school': forms.Select(attrs={'class': 'form-select'}),
            'department': forms.Select(attrs={'class': 'form-select'}),
            'semester': forms.Select(attrs={'class': 'form-select'}),
            'file': forms.ClearableFileInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['department'].queryset = Department.objects.all().order_by('name')
        self.fields['semester'].queryset = Semester.objects.all().order_by('name')