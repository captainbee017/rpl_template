from django.db import models
from django.core.validators import RegexValidator

from redactor.fields import RedactorField
# Create your models here.

phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$')

AUSTRALIA, OVERSEAS, OTHERS = 0, 1, 2
EXPERIENCE_LOCATION = (
	(AUSTRALIA, 'Australia'),
	(OVERSEAS, 'Overseas'),
	(OTHERS, 'Others'),
)
PUBLISHED, REQUESTED = 0, 1
STATUS_CHOICES = (
	(PUBLISHED, 'Published'),
	(REQUESTED, 'Requested'),
	)


class VisitorQuery(models.Model):
	'''
	Stores visitors query for RPL Finder team
	from landing page
	'''
	name = models.CharField(max_length=200)
	email = models.EmailField(max_length=200)
	phone_number = models.CharField(validators=[phone_regex],
		max_length=20)
	message = models.TextField()

	def __str__(self):
		return self.name

class QualificationCategory(models.Model):
	name = models.CharField(max_length=200)

	def __str__(self):
		return self.name


class Qualification(models.Model):
	'''
	Stores all qualifications
	search_count to find the popular qualifications
	'''
	category = models.ForeignKey(QualificationCategory)
	code = models.CharField(max_length=100, unique=True, null=True)
	name = models.CharField(max_length=200)
	description = models.TextField(null=True)
	job_roles = models.TextField(null=True)
	fees = models.TextField(null=True)
	packaging_rule = models.TextField(null=True)
	status = models.PositiveIntegerField(
		choices=STATUS_CHOICES, default=PUBLISHED)
	search_count = models.PositiveIntegerField(default=0)

	def __str__(self):
		return "{}".format(self.name)


class Skill(models.Model):
	name = models.CharField(max_length=100)


class SkillAsessmentUser(models.Model):
	'''
	Log all skill test from visitors 
	'''
	name = models.CharField(max_length=100)
	email = models.EmailField(max_length=100)
	phone = models.CharField(validators=[phone_regex], max_length=20)
	qualification = models.ForeignKey(Qualification)
	qualification_other = models.CharField(max_length=200, null=True)
	skills = models.ManyToManyField(Skill)
	experience_year = models.PositiveIntegerField(null=True)
	experience_month = models.PositiveIntegerField(null=True)
	experience_location = models.PositiveIntegerField(
		choices=EXPERIENCE_LOCATION)
	formal_qualification = models.BooleanField(default=True)
	formal_details = models.TextField(null=True, blank=True)
	state = models.CharField(max_length=50)
	comments = models.TextField()

	def __str__(self):
		return self.first_name


class Testimonial(models.Model):
	'''
	In case we need to update testimonials
	'''
	dp = models.FileField(upload_to='docs/images/testimonials')
	name = models.CharField(max_length=100)
	designation = models.CharField(max_length=200)
	message = RedactorField()

	def __str__(self):
		return self.name


class NewslettterRequest(models.Model):
	'''
	Log visitors email to send them newsletter
	'''
	email = models.EmailField(max_length=100)
	date = models.DateTimeField(auto_now_add=True, null=True)

	def __st__(self):
		return self.email


class EmailContent(models.Model):
	''' AutoResponder text to send to visitors
	'''
	body = RedactorField(max_length=200)
	is_active = models.BooleanField(default=True)
