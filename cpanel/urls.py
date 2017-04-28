from django.conf.urls import url
from cpanel.views import (
    DashboardView, AutoResponderView, QualificationView, QualificationAddView,
    TestimonialView, TestimonialCreateView, TestimonialUpdateView, TestimonialDeleteView,
    QualificationDetailView, QualificationUpdateView, QualificationDeleteView,
    ContactUsCreateView)

from bot.autocomplete import GetQualificationCategory

from django.contrib.auth import views as auth_views


urlpatterns = [
    url(r'^$',
        auth_views.LoginView.as_view(template_name='cp/cp_auth.html'),
        name='cp_auth'),

    url(r'^dashboard/$',
        DashboardView.as_view(), name='cpanel_dashboard'),

    url(r'^autoresponder/$',
        AutoResponderView.as_view(), name='autoresponder'),

    url(r'^qualifications/$',
        QualificationView.as_view(), name='qualifications'),

    url(r'^qualifications/add/$',
        QualificationAddView.as_view(), name='qualification_add'),

    url(r'^testimonials/$',
        TestimonialView.as_view(), name='testimonials'),

    url(r'^testimonials/add/$',
        TestimonialCreateView.as_view(), name='testimonials_add'),

    url(r'^testimonials/edit/(?P<pk>\d+)/$',
        TestimonialUpdateView.as_view(), name='testimonials_edit'),

    url(r'^testimonials/delete/(?P<pk>\d+)/$',
        TestimonialDeleteView.as_view(), name='testimonials_delete'),

    url(r'^qualification/detail/(?P<pk>\d+)/$',
        QualificationDetailView.as_view(), name='qualification_detail'),

    url(r'^qualification/edit/(?P<pk>\d+)/$',
        QualificationUpdateView.as_view(), name='qualification_edit'),

    url(r'^qualification/delete/(?P<pk>\d+)/$',
        QualificationDeleteView.as_view(), name='qualification_delete'),

    # url(r'^qualification/add/$',
    #   QualificationCreateView.as_view(), name='qualification_add'),

    url(r'^fetch-qualification-category/$',
        GetQualificationCategory.as_view(), name='fetch_qualification_category'),

    url(r'^contact-us/$',
        ContactUsCreateView.as_view(), name='contact_us_create'),
]