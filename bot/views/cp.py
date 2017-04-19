from django.views.generic import FormView

from django.contrib.auth.models import User
from bot.cp_forms import CPSignUpForm


class CPAuthView(FormView):
	form_class = CPSignUpForm
	model = User
	# fields = ['email', 'password', ]
	template_name = 'cp/cp_auth.html'
