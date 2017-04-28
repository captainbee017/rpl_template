import re
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.generic import View, ListView
from bot.models import PUBLISHED, Qualification
from django.db.models import Q


class QualificationSearch(ListView):
    model = Qualification
    template_name = 'qualification/search_result.html'

    def dispatch(self, *args, **kwargs):
        query = self.request.GET.get('query')
        print(query)
        if query:
            obj = get_object_or_404(Qualification, id=query)
            obj.search_count += 1
            obj.save()
            return HttpResponseRedirect(
                reverse('qualification_detail_page', args=[obj.id]))
        return super().dispatch(*args, **kwargs)


    # def get_objects(self):
    #     query = self.request.GET.get('q', None)
    #     lookup_query = self.get_searchbar_filters()
    #     if lookup_query:
    #         results = Qualification.objects.filter(lookup_query)
    #     return results

    # def get_searchbar_filters(self):
    #     search_fields = [
    #         'category__name__icontains',
    #         'code__icontains',
    #         'name__icontains',
    #         'description__icontains',
    #         'job_roles__icontains',
    #         'fees__icontains',
    #         'packaging_rule__icontains',
    #     ]
    #     query_str = self.request.GET.get('q', None)
    #     if query_str:
    #         query = self.get_normalized_query(query_str, search_fields)
    #         return query

    # def get_normalized_query(self, query_str, search_fields):
    #     query = Q()
    #     query_tokens = self.tokenize_query(query_str)
    #     for token in query_tokens:
    #         search_terms = None
    #         for field in search_fields:
    #             lookup_query = Q(**{"{}".format(field): token})
    #             if search_terms is None:
    #                 search_terms = lookup_query
    #             else:
    #                 search_terms = search_terms | lookup_query
    #         if query is None:
    #             query = search_terms
    #         else:
    #             query = query | search_terms
    #     return query

    # def get_queryset(self, *args, **kwargs):
    #     return self.get_objects()

    # def tokenize_query(self, query_string):
    #     """do a magical splitting of search query and return them
    #     as a list of words """
    #     # remove conjunction words
    #     query_string = re.sub(
    #         '(a|an|and|the|is|in|at|on|for|so|but|by|as|if|)', "", query_string)
    #     findterms = re.compile(r'"([^"]+)"|(\S+)').findall
    #     normspace = re.compile(r'\s{2,}').sub
    #     return [normspace(' ', (t[0] or t[1]).strip()) for t in findterms(query_string)]
