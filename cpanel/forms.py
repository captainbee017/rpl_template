from django import forms
from bot.models import EmailContent, Qualification, NewslettterRequest, Testimonial, QualificationCategory

from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class AutoResponderForm(forms.ModelForm):

	class Meta:
		model = EmailContent
		fields = ['is_active', 'body']

	def __inti__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.fields['body'].label = ''


class QualificationForm(forms.ModelForm):
	category = forms.ModelChoiceField(
		queryset=QualificationCategory.objects.all())

	class Meta:
		model = Qualification
		fields = [
			'category', 'code', 'name', 'description', 'job_roles', 'fees',
			'packaging_rule']


	def __init__(self, *args, **kwargs):
	    super().__init__(*args, **kwargs)
	    self.fields['description'].label = ''
	    self.fields['job_roles'].label = ''
	    self.fields['fees'].label = ''
	    self.fields['packaging_rule'].label = ''



class TestimonialForm(forms.ModelForm):

	class Meta:
		model = Testimonial
		fields = ['dp', 'name', 'designation', 'message']
		widgets = {
			'name': forms.TextInput(attrs={'placeholder': 'Name'}),
			'designation': forms.TextInput(attrs={'placeholder': 'Designation'})
		}
