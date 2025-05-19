from django import forms
from .models import Application, School, Department, State, Lga, AcademicSession, Year, Semester
from django.core.validators import RegexValidator
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import (
    Application,
    School,
    Department,
    State,
    Lga,
    AcademicSession,
    Year,
    Semester
)

class ApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        exclude = ['application_number', 'year', 'semester', 'is_approved', 'created_at']
        widgets = {
            'date_of_birth': forms.DateInput(
                attrs={
                    'type': 'date',
                    'class': 'form-control'
                }
            ),
            'surname': forms.TextInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'Enter your surname'
                }
            ),
            'first_name': forms.TextInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'Enter your first name'
                }
            ),
            'other_name': forms.TextInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'Enter other names (if any)'
                }
            ),
            'email': forms.EmailInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'example@domain.com'
                }
            ),
            'phone_number': forms.TextInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': '08012345678'
                }
            ),
            'address': forms.TextInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'Your current residential address'
                }
            ),
            'state_of_origin': forms.Select(
                attrs={
                    'class': 'form-control'
                }
            ),
            'local_government': forms.Select(
                attrs={
                    'class': 'form-control'
                }
            ),
            'school': forms.Select(
                attrs={
                    'class': 'form-control'
                }
            ),
            'department': forms.Select(
                attrs={
                    'class': 'form-control'
                }
            ),
            'academic_session': forms.Select(
                attrs={
                    'class': 'form-control'
                }
            ),
            'year': forms.Select(
                attrs={
                    'class': 'form-control'
                }
            ),
            'semester': forms.Select(
                attrs={
                    'class': 'form-control'
                }
            ),
            'profile_picture': forms.FileInput(
                attrs={
                    'class': 'file-upload-input'
                }
            ),
        }
        labels = {
            'surname': 'Surname',
            'first_name': 'First Name',
            'other_name': 'Other Name (Optional)',
            'profile_picture': 'Upload a clear passport photograph',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set required fields
        self.fields['surname'].required = True
        self.fields['first_name'].required = True
        self.fields['email'].required = True
        self.fields['phone_number'].required = True
        self.fields['address'].required = True
        self.fields['state_of_origin'].required = True
        self.fields['local_government'].required = True
        self.fields['date_of_birth'].required = True
        self.fields['school'].required = True
        self.fields['department'].required = True
        self.fields['academic_session'].required = True
        
        # Add phone number validation
        self.fields['phone_number'].validators = [
            RegexValidator(
                regex=r'^[0-9]{11}$',
                message='Phone number must be 11 digits'
            )
        ]
        
        # Initialize department and LGA querysets as empty
        self.fields['department'].queryset = Department.objects.none()
        self.fields['local_government'].queryset = Lga.objects.none()

        # If form is bound (submitted), try to filter the querysets
        if 'school' in self.data:
            try:
                school_id = int(self.data.get('school'))
                self.fields['department'].queryset = Department.objects.filter(
                    school_id=school_id
                ).order_by('name')
            except (ValueError, TypeError):
                pass  # invalid input from the client; ignore and fallback to empty queryset
        elif self.instance and self.instance.pk and hasattr(self.instance, 'school'):
            self.fields['department'].queryset = self.instance.school.departments.order_by('name')

        if 'state_of_origin' in self.data:
            try:
                state_id = int(self.data.get('state_of_origin'))
                self.fields['local_government'].queryset = Lga.objects.filter(
                    state_of_origin_id=state_id
                ).order_by('name')
            except (ValueError, TypeError):
                pass  # invalid input from the client; ignore and fallback to empty queryset
        elif self.instance and self.instance.pk and hasattr(self.instance, 'state_of_origin'):
            self.fields['local_government'].queryset = self.instance.state_of_origin.lgas.order_by('name')

    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        if not phone_number.isdigit():
            raise forms.ValidationError("Phone number must contain only digits.")
        return phone_number

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if Application.objects.filter(email=email).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise forms.ValidationError("This email is already in use.")
        return email

    
    def clean_profile_picture(self):
        profile_picture = self.cleaned_data.get('profile_picture')
        if profile_picture and hasattr(profile_picture, 'size'):
            if profile_picture.size > 2 * 1024 * 1024:  # 2MB limit
               raise forms.ValidationError("Profile picture size should not exceed 2MB.")
            if not profile_picture.name.lower().endswith(('.jpg', '.jpeg', '.png')):
                raise forms.ValidationError("Only JPG, JPEG or PNG files are allowed.")
        return profile_picture


    def save(self, commit=True):
        instance = super().save(commit=False)
        
        if not instance.application_number:
            count = Application.objects.count() + 1
            instance.application_number = f"A2025{count:03d}"
        
        if commit:
            instance.save()
            self.save_m2m()
            
            # Create user account if not exists
            User.objects.get_or_create(
                username=instance.application_number,
                defaults={
                    'first_name': instance.first_name,
                    'last_name': instance.surname,
                    'email': instance.email,
                    'password': make_password(instance.surname),
                }
            )
        
        return instance
    

class ApplicantLoginForm(forms.Form):
    application_number = forms.CharField(label="Application Number", max_length=20)
    surname = forms.CharField(label="Surname", widget=forms.PasswordInput)


class StudentLoginForm(forms.Form):
    application_number = forms.CharField(label="Application Number or Matric Number", max_length=20)
    surname = forms.CharField(label="Surname", widget=forms.PasswordInput)

