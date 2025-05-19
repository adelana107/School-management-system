from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from portal.models import Student  # Or wherever your Student model is

class ApplicationOrMatricAuthBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        try:
            # Try application_number first
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Try to get student with that matric_number and fetch their user
            try:
                student = Student.objects.get(matric_number=username)
                user = User.objects.get(username=student.application_number)
            except Student.DoesNotExist:
                return None
            except User.DoesNotExist:
                return None

        if user.check_password(password):
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
