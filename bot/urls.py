'''
Langing page urls
'''

from django.conf.urls import url, include

from bot.views.index import (
	LandingPageView, QualificationView, PartnersView, ContactUsView, ApplyNowView)
from bot.views.qualification_search import QualificationSearch
from bot.views.cp import CPAuthView
from bot.views.fsa import SkillAsessment
from bot.autocomplete import (
	PopulateQualificaion,
	QualificationAutocomplete, SkillsAutocomplete)


urlpatterns = (
	url(r'^$', LandingPageView.as_view(), name='base_view'),

	url(r'^qualification/search/$',
		QualificationSearch.as_view(), name='qualification_search'),

	url(r'^qualification/$',
		QualificationView.as_view(), name='qualification_page'),

	url(r'^skill-asessment/$',
		SkillAsessment.as_view(), name='skill_asessment'),

	url(r'^partners/$',
		PartnersView.as_view(), name='partners_page'),

	url(r'^contact-us/$',
		ContactUsView.as_view(), name='contact_us_page'),

	url(r'^apply-now/$',
		ApplyNowView.as_view(), name='apply_now_page'),

	# url(r'^cp/$', CPAuthView.as_view(), name='cp_auth_view'),

	url(r'^fetch/',
		include([
			url(r'^qualification/$',
				PopulateQualificaion.as_view(), name='qualification_populate'),
	])),

	url(r'^autocomplete/',
		include([
			url(r'^qualification/$',
				QualificationAutocomplete.as_view(), name='qualification_autocomplete'),
			url(r'^skills/$',
				SkillsAutocomplete.as_view(), name='skills_autocomplete'),
		], namespace='autocomplete')),
)