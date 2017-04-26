from django.contrib import admin
from bot.models import (
	VisitorQuery, QualificationCategory, Qualification, SkillAsessmentUser,
	Testimonial)

# Register your models here.
admin.site.register(VisitorQuery)
admin.site.register(QualificationCategory)
admin.site.register(Qualification)
admin.site.register(SkillAsessmentUser)
admin.site.register(Testimonial)
