from django import forms
# from dal import autocomplete
from django.conf import settings
from datetime import datetime
from bot.models import (
    SkillAsessmentUser, Qualification, EXPERIENCE_LOCATION,
    NewslettterRequest, VisitorQuery)


class FileUploadForm(forms.Form):
    user_email = forms.CharField(max_length=200)
    upfile = forms.FileField(max_length=200)

    def save_to_dropbox(self):
        '''
        API v2
        Generate dropbox secret key from dropbox developers account.

        One directory per email.
        '''
        # client = dropbox.Dropbox(settings.DROPBOX_KEY)

        # email = self.cleaned_data['user_email']

        # obj, created = UserDetail.objects.get_or_create(email=email)
        # dir_name = obj.email
        # source_file = self.cleaned_data['upfile']
        # destination_file = '/test_dropbox/{}/{}/{}'.format(
        #     dir_name, str(datetime.now()), source_file)
        # client.files_upload(source_file.read(), destination_file)

        return True


class SkillAsessmentForm(forms.ModelForm):
    confirm_email = forms.CharField(widget=forms.EmailInput(
        attrs={'placeholder': ''}))

    qualification = forms.ChoiceField(
        choices=(
            ('', ''),
            ('1', 'Certificate III in Business'),
            ('2', 'Certificate III in Business Administration'),
            ('3', 'Certificate II in Retail Services'),
            ('4', 'Certificate III in Retail Operations'),
            ('5', 'Others')),
        widget=forms.Select(attrs={'width': '100%'})
        # queryset=Qualification.objects.all()
    )
    experience_location = forms.ChoiceField(
        choices=EXPERIENCE_LOCATION,
        label='',
        widget=forms.RadioSelect)
    formal_qualification = forms.ChoiceField(
        choices=((1, 'Yes'), (0, 'No')),
        label='',
        widget=forms.CheckboxInput)

    class Meta:
        model = SkillAsessmentUser
        fields = [
            'name', 'email', 'phone', 'qualification',
            'qualification_other', 'skills', 'experience_year', 'experience_month',
            'experience_location', 'formal_qualification', 'formal_details',
            'state', 'comments'
        ]
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': ''}),
            'phone': forms.TextInput(attrs={'placeholder': ''}),
            'email': forms.EmailInput(attrs={'placeholder': ''}),
            'qualification_other': forms.TextInput(attrs={'placeholder': ''}),
            'skills': forms.TextInput(attrs={'placeholder': ''}),
            'experience_year': forms.TextInput(attrs={'placeholder': ''}),
            'experience_month': forms.TextInput(attrs={'placeholder': ''}),
            # 'formal_qualification': forms.CheckboxInput(attrs={'label': ''}),
            'formal_details': forms.Textarea(
                attrs={'cols': 79, 'rows': 5, 'placeholder': ''}),
            'state': forms.TextInput(attrs={'placeholder': ''}),
            'comments': forms.Textarea(attrs={'cols': 79, 'rows': 5, 'placeholder': ''})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['qualification_other'].required = False
        self.fields['formal_details'].required = False
        self.fields['comments'].required = False


class NewspaperSignUp(forms.ModelForm):

    class Meta:
        model = NewslettterRequest
        fields = ['email']
        widgets = {
            'email': forms.TextInput(attrs={
                'class': 'form-control input-lg rounded-0',
                'placeholder': 'Your Email Address'})
        }


class QualificationSearchForm(forms.Form):

    query = forms.ModelChoiceField(
        queryset=Qualification.objects.all(),
        empty_label='Enter the course you want to study',
        widget=forms.Select(attrs={'class': 'input-lg'}))


class VisitorQueryForm(forms.ModelForm):

    class Meta:
        model = VisitorQuery
        fields = ['name', 'email', 'phone_number', 'message']
        widgets = {
            'email': forms.TextInput(attrs={'placeholder': 'Email'})
        }
