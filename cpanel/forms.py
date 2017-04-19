from django import forms
from bot.models import EmailContent, Qualification, NewslettterRequest, Testimonial

from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class CpLoginForm(forms.ModelForm):

	password = forms.CharField(widget=forms.PasswordInput())

	class Meta:
		model = User
		fields = ('email', 'password')

	def clean(self):
		try:
			attempt = User.objects.get(
				email=self.cleaned_data['email'])
			password = self.cleaned_data['password']
			if not attempt.check_password(password):
				raise forms.ValidationError('Incorrect password')
		except User.DoesNotExist:
			raise forms.ValidationError('That email is not authorized')
		return self.cleaned_data


class AutoResponderForm(forms.ModelForm):

	class Meta:
		model = EmailContent
		fields = ['is_active', 'body']

	def __inti__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.fields['body'].label = ''


class QualificationForm(forms.ModelForm):

	class Meta:
		model = Qualification
		fields = [
			'category', 'code', 'name', 'description', 'job_roles', 'fees',
			'packaging_rule']



class TestimonialForm(forms.ModelForm):

	class Meta:
		model = Testimonial
		fields = ['dp', 'name', 'designation', 'message']
		widgets = {
			'name': forms.TextInput(attrs={'placeholder': 'Name'}),
			'designation': forms.TextInput(attrs={'placeholder': 'Designation'})
		}

	# def save(self):
	# 	self.save()