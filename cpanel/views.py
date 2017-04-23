from django.shortcuts import render
from django.core.urlresolvers import reverse_lazy
from django.views.generic import (
	TemplateView, FormView, ListView, DetailView, CreateView, UpdateView, DeleteView)
from django.contrib.auth.mixins import LoginRequiredMixin


from bot.models import (
	EmailContent, QualificationCategory, Qualification, NewslettterRequest,
	Testimonial)
from cpanel.forms import AutoResponderForm, QualificationForm, TestimonialForm

from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from datetime import timedelta
from django.utils import timezone


class DashboardView(LoginRequiredMixin, TemplateView):
	template_name = 'dashboard.html'
	benchmark = 30
	param = 'Days'

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


class AutoResponderView(LoginRequiredMixin, UpdateView):
	model = EmailContent
	form_class = AutoResponderForm
	template_name = 'autoresponder.html'
	success_url = reverse_lazy('autoresponder')

	def get_object(self, *args, **kwargs):
		try:
			obj = EmailContent.objects.get(is_active=True)
		except EmailContant.DoesNotExist:
			obj = EmailContant.objects.none()
		return obj


class QualificationView(LoginRequiredMixin, ListView):
	model = QualificationCategory
	template_name = 'qualification.html'

	def get_context_data(self, *args, **kwargs):
		ctx = super().get_context_data(*args, **kwargs)
		ctx['form'] = QualificationForm()
		return ctx


class QualificationAddView(LoginRequiredMixin, CreateView):
	model = Qualification
	form_class = QualificationForm
	template_name = 'qualification_add.html'
	success_url = reverse_lazy('qualifications')


class QualificationDetailView(LoginRequiredMixin, DetailView):
	model = Qualification
	template_name = 'qualification_detail_modal.html'


class QualificationUpdateView(LoginRequiredMixin, UpdateView):
	model = Qualification
	form_class = QualificationForm
	success_url = reverse_lazy('qualifications')
	template_name = 'qualification_add.html'


class QualificationDeleteView(LoginRequiredMixin, DeleteView):
	model = Qualification
	success_url = reverse_lazy('qualifications')
	template_name = 'qualification_delete.html'


class TestimonialView(LoginRequiredMixin, FormView):
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
