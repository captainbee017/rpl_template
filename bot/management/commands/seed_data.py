from django.core.management.base import BaseCommand
from bot.models import QualificationCategory, PUBLISHED, Qualification

class Command(BaseCommand):

	DATAS = {
		'Business, Management and finance': [
			'BSB20115 - Certificate II in Business',
			'BSB30115 - Certificate III in Business',
			'BSB30415 - Certificate III in Business Administration',
			'SB40215 - Certificate IV in Business',
			'BSB41315 - Certificate IV in Marketing',
			'BSB41415 - Certificate IV in Work Health and Safety',
			'BSB42015 - Certificate IV in Leadership and Management',
			'BSB41415 - Certificate IV in Work Health and Safety',
			'BSB50215 - Diploma of Business',
			'BSB51315 - Diploma of Work Health and Safety',
			'BSB51415 - Diploma of Project Management',
			'BSB51615 - Diploma of Quality Auditing',
			'BSB51915 - Diploma of Leadership and Management',
			'BSB51915 - Diploma of Leadership and Management',
			'BSB60215 - Advanced Diploma of Business',
			'BSB61015 - Advanced Diploma of Leadership and Management',
			'FNS30315 - Certificate III in Accounts Administration',
			'FNS40215 - Certificate IV in Bookkeeping',
			'FNS50215 - Diploma of Accounting',
			'FNS60215 - Advanced Diploma of Accounting',],
		'Retail Service': [
			'SIR20212 - Certificate II in Retail Services',
			'SIR30212 - Certificate III in Retail Operations',
			'SIR50112 - Diploma of Retail Management',],
		'Travel, Tourism and Hospitality': [
			'SIT20213 - Certificate II in Hospitality',
			'SIT20312 - Certificate II in Kitchen Operations',
			'SIT20316 - Certificate II in Hospitality',
			'SIT20416 - Certificate II in Kitchen Operations',
			'SIT30616 - Certificate III in Hospitality',
			'SIT30816 - Certificate III in Commercial Cookery',
			'SIT40516 - Certificate IV in Commercial Cookery',
			'SIT50313 - Diploma of Hospitality',
			'SIT50416 - Diploma of Hospitality Management',
			'SIT60316 - Advanced Diploma of Hospitality Management',],
		'Childcare and Community Services': [
			'CHC30113 - Certificate III in Early Childhood Education and Care',
			'CHC40113 - Certificate IV in School Age Education and Care',
			'CHC40213 - Certificate IV in Education Support',
			'CHC50113 - Diploma of Early Childhood Education and Care',
			'CHC50213 - Diploma of School Age Education and Care'],
		'Training and Education Training Package': [
			'TAE40110 - Certificate IV in Training and Assessment',
			'TAE50111 - Diploma of Vocational Education and Training'],
		'Creative Arts and Culture Training Package': [
			'CUA20715 - Certificate II in Visual Arts',
			'CUA31115 - Certificate III in Visual Arts']
	}


	def handle(self, *args, **kwargs):
		for key, value in self.DATAS.items():
			obj, created = QualificationCategory.objects.get_or_create(
				name=key)
			for cat_name in value:
				qualification = cat_name.split('-')
				Qualification.objects.get_or_create(
					category=obj,
					code=qualification[0],
					name=qualification[1],
					status=PUBLISHED)

			self.stdout.write('Qualification {}'.format(obj.name))

		self.update_slug()

	def update_slug(self):
		for obj in QualificationCategory.objects.all():
			name = obj.name.replace(',', '').replace(' ', '-')
			slug = '{}-{}'.format(name, obj.id)
			obj.slug=slug
			obj.save()
		return
