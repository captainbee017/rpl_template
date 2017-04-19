from django.conf.urls import include, url
from cpanel.views import (
	DashboardView, AutoResponderView, QualificationView,
	TestimonialView, QualificationDetailView, QualificationCreateView)

from bot.views.index import CpLoginView

urlpatterns = [
	url(r'^$',
		CpLoginView.as_view(), name='cp_auth'),

	url(r'^dashboard/$',
		DashboardView.as_view(), name='cpanel_dashboard'),

	url(r'^autoresponder/$',
		AutoResponderView.as_view(), name='autoresponder'),

	url(r'^qualifications/$',
		QualificationView.as_view(), name='qualifications'),

	url(r'^testimonials/$',
		TestimonialView.as_view(), name='testimonials'),
	
	url(r'^qualification/detail/(?P<pk>\d+)/$',
		QualificationDetailView.as_view(), name='qualification_detail'),

	url(r'^qualification/add/$',
		QualificationCreateView.as_view(), name='qualification_add'),
]