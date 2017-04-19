from django import forms

from django.contrib.auth.models import User


class CPSignUpForm(forms.ModelForm):

	class Meta:
		model = User
		fields = ['email', 'password']