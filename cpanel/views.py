from django.shortcuts import render
from django.core.urlresolvers import reverse_lazy
from django.views.generic import (
	TemplateView, FormView, ListView, DetailView, CreateView)
from bot.models import (
	EmailContent, QualificationCategory, Qualification, NewslettterRequest,
	Testimonial)
from cpanel.forms import AutoResponderForm, QualificationForm, TestimonialForm

from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from datetime import timedelta
from django.utils import timezone

# Create your views here.


class DashboardView(TemplateView):
	template_name = 'dashboard.html'
	benchmark = 30
	param = 'Days'
	# params sample
	# ['Days', 'Weeks', 'Months']

	def get_context_data(self, *args, **kwargs):
		ctx = super().get_context_data(*args, **kwargs)
		ctx['subscribers'] = self.get_numbers()
		ctx['benchmark'] = self.benchmark
		ctx['param'] = self.param
		return ctx

	def get_numbers(self):
		'''
		receives benchmark in days
		X signups in DD days
		Expected Numbers {'date': ['email1', 'email2'] }
		'''

		benchmark_date = timezone.now() - timedelta(days=self.benchmark)
		subscribers = NewslettterRequest.objects.filter(
			date__gte=benchmark_date)
		data = []
		if subscribers.exists():
			for user in subscribers:
				if not user.email in data:
					data.append(user.email)
		return data


class AutoResponderView(FormView):
	model = EmailContent
	form_class = AutoResponderForm
	template_name = 'autoresponder.html'

	def dispatch(self, *args, **kwargs):
		try:
			self.obj = EmailContent.objects.get(is_active=True)
		except EmailContent.DoesNotExist:
			self.obj = None
		return super().dispatch(*args, **kwargs)

	def get_form_kwargs(self, *args, **kwargs):
		kwargs = super().get_form_kwargs(*args, **kwargs)
		kwargs['initial'] = {
			'is_active': self.obj.is_active if self.obj else None,
			'body': self.obj.body if self.obj else None
		}
		return kwargs

	def get_context_data(self, *args, **kwargs):
		ctx = super().get_context_data(*args, **kwargs)
		ctx['object'] = self.obj
		return ctx

	def form_valid(self, form):
		obj, created = EmailContent.objects.update_or_create(
			is_active=True,
			defaults={
				'body': form.cleaned_data['body']
			})
		return HttpResponseRedirect(reverse('autoresponder'))


class QualificationView(ListView):
	model = QualificationCategory
	template_name = 'qualification.html'

	def get_context_data(self, *args, **kwargs):
		ctx = super().get_context_data(*args, **kwargs)
		ctx['form'] = QualificationForm()
		return ctx


class QualificationDetailView(DetailView):
	model = Qualification
	template_name = 'qualification_detail.html'


class QualificationCreateView(CreateView):
	model = Qualification
	form_class = QualificationForm
	success_url = reverse_lazy('qualifications')
	template_name = 'qualification_form.html'

	def form_valid(self, form):
		print("im here")
		return super().form_valid(form)


class TestimonialView(FormView):
	template_name = 'testimonial.html'
	form_class = TestimonialForm

	def get_context_data(self, *args, **kwargs):
		ctx = super().get_context_data(*args, **kwargs)
		ctx['object_list'] = Testimonial.objects.all()
		return ctx

	def post(self, *args, **kwargs):
		return super().post(*args, **kwargs)

	def form_valid(self, form):
		form.save()
		return super().form_valid(form)

	def get_success_url(self):
		return reverse('testimonials')