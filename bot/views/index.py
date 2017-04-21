from django.shortcuts import render
from django.views.generic import TemplateView, FormView
from django.core.urlresolvers import reverse
import dropbox
from django.conf import settings
from django.core.urlresolvers import reverse_lazy

# from bot.forms import FileUploadForm
from bot.forms import NewspaperSignUp
from cpanel.forms import CpLoginForm
from django.contrib import messages
from bot.models import NewslettterRequest


# Create your views here.


class CpLoginView(FormView):
	form_class = CpLoginForm
	template_name = 'cp/cp_auth.html'

	def post(self, request, *args, **kwargs):
		return super().post(request, *args, **kwargs)

	def get_success_url(self):
		return reverse('cpanel_dashboard')


class LandingPageView(FormView):
	template_name = 'base.html'
	success_url = reverse_lazy('base_view')
	form_class = NewspaperSignUp

	def post(self, *args, **kwargs):
		return super().post(*args, **kwargs)

	def form_valid(self, form):
		NewslettterRequest.objects.create(
			email=form.cleaned_data.get('email'))
		# form.save_to_dropbox()
		messages.success(self.request, "Thanks for Signing up")
		return super().form_valid(form)


class QualificationView(TemplateView):
	template_name = 'qualification_page.html'


class QualificationDetailView(TemplateView):
	template_name = 'qualification_detail.html'


class RPLSkillRecognitionView(TemplateView):
	template_name = 'skill_asessment_form.html'


class PartnersView(TemplateView):
	template_name = 'partners_page.html'


class ContactUsView(TemplateView):
	template_name = 'contact_us.html'


class ApplyNowView(TemplateView):
	template_name = 'apply_now.html'
