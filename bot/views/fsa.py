from django.views.generic import FormView, CreateView, View
from bot.forms import SkillAsessmentForm
from bot.models import SkillAsessmentUser, EmailContent
from django.core.urlresolvers import reverse_lazy

from django.core.mail import send_mail


class SkillAsessment(CreateView):
	model = SkillAsessmentUser
	form_class = SkillAsessmentForm
	template_name = 'skill_asessment_form.html'
	success_url = reverse_lazy('skill_asessment')

	def form_valid(self, form):
		lname = form.cleaned_data['last_name']
		email = form.cleaned_data['email']
		self.send_email(lname, email)
		return super().form_valid(form)

	def send_email(sel, lname, email):
		'''
		use regular expression to extract names fron the content
		'''
		email_content = EmailContent.objects.all()[0]
		email_content = email_content.body.replace("{{lname}}", lname)
		send_mail(
			'Free Skill Assessment',
			email_content, 
			'info@rplfinder.com',
			[email], fail_silently=False,
		)
		return