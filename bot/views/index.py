from django.views.generic import TemplateView, FormView, DetailView, ListView
from django.core.urlresolvers import reverse_lazy

from bot.forms import NewspaperSignUp, QualificationSearchForm
from django.contrib import messages
from bot.models import NewslettterRequest, Qualification, QualificationCategory


class LandingPageView(FormView):
    template_name = 'base.html'
    success_url = reverse_lazy('base_view')
    form_class = NewspaperSignUp

    def post(self, *args, **kwargs):
        return super().post(*args, **kwargs)

    def form_valid(self, form):
        NewslettterRequest.objects.create(
            email=form.cleaned_data.get('email'))
        messages.success(self.request, "Thanks for Signing up")
        return super().form_valid(form)

    def get_context_data(self, *args, **kwargs):
        ctx = super().get_context_data(*args, **kwargs)
        ctx['search_form'] = QualificationSearchForm
        ctx['popular_courses'] = self.get_popular_courses()
        return ctx

    def get_popular_courses(self):
        objects = Qualification.objects.filter(
            description__isnull=False).order_by('search_count')[:4]
        return objects


class QualificationView(ListView):
    model = QualificationCategory
    template_name = 'qualification_page.html'

    def get_context_data(self, *args, **kwargs):
        ctx = super().get_context_data(*args, **kwargs)
        ctx['search_form'] = QualificationSearchForm
        return ctx


class QualificationDetailView(DetailView):
    model = Qualification
    template_name = 'qualification_detail.html'


class RPLSkillRecognitionView(TemplateView):
    template_name = 'skill_asessment_form.html'


class PartnersView(TemplateView):
    template_name = 'partners_page.html'


class ContactUsView(TemplateView):
    template_name = 'contact_us.html'


class ApplyNowView(TemplateView):
    template_name = 'apply_now.html'
