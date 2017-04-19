from dal import autocomplete

from django.http import JsonResponse
from django.views.generic import View

from bot.models import Qualification


class PopulateQualificaion(View):

	def get(self, *args, **kwargs):
		data = [
			'Diploma of Business',
			'Advanced Diploma of Hospitality Management',
			'Diploma of Quality Auditing',
			'Diploma of Leadership and Management'
		]
		return JsonResponse(data, safe=False)


class QualificationAutocomplete(autocomplete.Select2QuerySetView):
    
    def get_queryset(self):
        qs = Qualification.objects.all()
        if self.q:
            qs = qs.filter(name__icontains=self.q)
        return qs


class SkillsAutocomplete(autocomplete.Select2QuerySetView):

	def get_queryset(self):
		qs = Skills.objects.filter(name__istartswith=self.q)
		return qs