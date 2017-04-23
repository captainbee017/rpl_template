from django.conf.urls import include, url
from cpanel.views import (
	DashboardView, AutoResponderView, QualificationView, QualificationAddView,
	TestimonialView, QualificationDetailView, 
	QualificationUpdateView, QualificationDeleteView)

from bot.autocomplete import GetQualificationCategory

# from cpanel.views import CpLoginView
# from django.contrib.auth.views import LoginView
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
	
	url(r'^qualification/detail/(?P<pk>\d+)/$',
		QualificationDetailView.as_view(), name='qualification_detail'),

	url(r'^qualification/edit/(?P<pk>\d+)/$',
		QualificationUpdateView.as_view(), name='qualification_edit'),

	url(r'^qualification/delete/(?P<pk>\d+)/$',
		QualificationDeleteView.as_view(), name='qualification_delete'),

	# url(r'^qualification/add/$',
	# 	QualificationCreateView.as_view(), name='qualification_add'),

	url(r'^fetch-qualification-category/$',
		GetQualificationCategory.as_view(), name='fetch_qualification_category'),
]