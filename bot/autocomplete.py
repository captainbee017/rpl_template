# from dal import autocomplete

from django.http import JsonResponse
from django.views.generic import View

from bot.models import Qualification, QualificationCategory


class PopulateQualificaion(View):

    def get(self, *args, **kwargs):
        query = self.request.GET.get('query')
        objects = Qualification.objects.filter(name__icontains=query)
        if not query:
            objects = objects[:10]
        datasets = []
        for obj in objects:
            data = {'id': obj.id, 'text': obj.name}
            datasets.append(data)
        return JsonResponse(datasets, safe=False)


# class QualificationAutocomplete(autocomplete.Select2QuerySetView):

#     def get_queryset(self):
#         qs = Qualification.objects.all()
#         if self.q:
#             qs = qs.filter(name__icontains=self.q)
#         return qs


# class SkillsAutocomplete(autocomplete.Select2QuerySetView):

#     def get_queryset(self):
#         qs = Skills.objects.filter(name__istartswith=self.q)
#         return qs


class GetQualificationCategory(View):

    def get(self, *args, **kwargs):
        query = self.request.GET.get('text')
        objects = QualificationCategory.objects.filter(name__istartswith=query)
        datasets = []
        for obj in objects:
            data = {'id': obj.id, 'text': obj.name}
            datasets.append(data)
        return JsonResponse(datasets, safe=False)

    def post(self, *args, **kwargs):
        query = self.request.POST.get('input')
        try:
            obj = QualificationCategory.objects.get(
                name__iexact=query)
        except QualificationCategory.DoesNotExist:
            obj = QualificationCategory.objects.create(
                name=query)
        datasets = [{'id': obj.id, 'text': obj.name}]
        return JsonResponse(datasets, safe=False)
