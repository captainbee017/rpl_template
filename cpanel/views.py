from django.core.urlresolvers import reverse_lazy
from django.views.generic import (
    FormView,
    TemplateView, ListView, DetailView, CreateView, UpdateView, DeleteView)
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.http import HttpResponseRedirect

from bot.forms import VisitorQueryForm
from bot.models import (
    EmailContent, QualificationCategory, Qualification, NewslettterRequest,
    Testimonial, VisitorQuery)
from cpanel.forms import AutoResponderForm, QualificationForm

from django.core.urlresolvers import reverse
from datetime import timedelta
from django.utils import timezone


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard.html'
    benchmark = 30
    param = 'Days'

    def get_context_data(self, *args, **kwargs):
        ctx = super().get_context_data(*args, **kwargs)
        ctx['subscribers'] = self.get_subscribers_numbers()
        ctx['contacts'] = self.get_contacts_lists()
        ctx['benchmark'] = self.benchmark
        ctx['param'] = self.param
        return ctx

    def get_contacts_lists(self):
        obj = VisitorQuery.objects.all()
        return obj

    def get_subscribers_numbers(self):
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
                if user.email not in data:
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
        except EmailContent.DoesNotExist:
            obj = None
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


class TestimonialView(LoginRequiredMixin, ListView):
    model = Testimonial
    template_name = 'testimonial.html'


class TestimonialCreateView(LoginRequiredMixin, CreateView):
    model = Testimonial
    template_name = 'testimonial_add.html'
    success_url = reverse_lazy('testimonials')
    fields = ['dp', 'name', 'designation', 'message']


class TestimonialDeleteView(LoginRequiredMixin, DeleteView):
    model = Testimonial
    template_name = 'testimonial_delete.html'
    success_url = reverse_lazy('testimonials')


class TestimonialUpdateView(LoginRequiredMixin, UpdateView):
    model = Testimonial
    template_name = 'testimonial_add.html'
    success_url = reverse_lazy('testimonials')
    fields = ['dp', 'name', 'designation', 'message']


class ContactUsCreateView(CreateView):
    model = VisitorQuery
    form_class = VisitorQueryForm
    template_name = 'base.html'

    def get_success_url(self):
        messages.success(
            self.request, "Thanks for the message.")
        return self.request.META.get('HTTP_REFERER', '/')