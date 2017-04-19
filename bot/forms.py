from django import forms
from dal import autocomplete
import dropbox
from django.conf import settings
from datetime import datetime, date
from bot.models import SkillAsessmentUser, Qualification, EXPERIENCE_LOCATION, NewslettterRequest

from crispy_forms.helper import FormHelper
from crispy_forms.layout import (
    Layout, Div, Field, HTML)
# from bot.models import UserDetail


class FileUploadForm(forms.Form):
    user_email = forms.CharField(max_length=200)
    upfile = forms.FileField(max_length=200)

    def save_to_dropbox(self):
        '''
        API v2
        Generate dropbox secret key from dropbox developers account.

        One directory per email.        
        '''
        client = dropbox.Dropbox(settings.DROPBOX_KEY)

        email = self.cleaned_data['user_email']

        obj, created = UserDetail.objects.get_or_create(email=email)
        dir_name = obj.email
        source_file = self.cleaned_data['upfile']
        destination_file = '/test_dropbox/{}/{}/{}'.format(
            dir_name, str(datetime.now()), source_file)
        client.files_upload(source_file.read(), destination_file)

        return True


class SkillAsessmentForm(forms.ModelForm):
    confirm_email = forms.CharField(widget=forms.EmailInput())

    qualification = forms.ModelChoiceField(
        queryset=Qualification.objects.all(),
        widget=autocomplete.ModelSelect2(url='autocomplete:qualification_autocomplete')
    )
    experience_location = forms.ChoiceField(
        choices = EXPERIENCE_LOCATION,
        widget=forms.RadioSelect)

    class Meta:
        model = SkillAsessmentUser
        fields = [
            'name', 'email', 'phone', 'qualification',
            'qualification_other', 'skills', 'experience_year', 'experience_month',
            'experience_location', 'formal_qualification', 'formal_details',
            'state', 'comments'
        ]
        widgets = {
            'skills': autocomplete.ModelSelect2Multiple(
                url='autocomplete:skills_autocomplete'),
            'comments': forms.Textarea(attrs={'cols': 79, 'rows': 5})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_tag = False
        self.helper.help_text_inline = True
        # self.helper.form_class = 'form-horizontal'
        self.helper.field_class = 'form-group'
        self.helper.field_template = 'bootstrap4/layout/horizontal_form.html'
        self.fields['name'].width = '100'
        self.fields['name'].label = 'Your Full Name'
        self.fields['qualification'].label = ""
        self.fields['qualification_other'].required = False
        self.fields['skills'].label = ''
        self.fields['skills'].required = False
        self.fields['experience_year'].required = False
        self.fields['experience_month'].required = False
        self.fields['comments'].required = False
        self.fields['experience_location'].label = ''
        self.fields['formal_qualification'].label = ''
        self.fields['formal_details'].label = 'Details about your formal qualifications'
        self.fields['state'].label = ''
        self.fields['comments'].label = 'Any messages ?'


class NewspaperSignUp(forms.ModelForm):

    class Meta:
        model = NewslettterRequest
        fields = ['email']
        widgets = {
            'email': forms.TextInput(attrs={
                'class': 'form-control input-lg',
                'placeholder': 'Your Email Address'})
        }
