# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-29 03:55
from __future__ import unicode_literals

from django.db import migrations
import redactor.fields


class Migration(migrations.Migration):

    dependencies = [
        ('bot', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='qualificationcategory',
            name='description',
            field=redactor.fields.RedactorField(null=True),
        ),
    ]
