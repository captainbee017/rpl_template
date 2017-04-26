from bot.forms import VisitorQueryForm


def contact_form(request):
	return {'query_form': VisitorQueryForm}