# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2017-04-22 06:53
from __future__ import unicode_literals

from django.db import migrations
import redactor.fields


class Migration(migrations.Migration):

    dependencies = [
        ('bot', '0015_auto_20170418_1801'),
    ]

    operations = [
        migrations.AlterField(
            model_name='qualification',
            name='description',
            field=redactor.fields.RedactorField(null=True),
        ),
        migrations.AlterField(
            model_name='qualification',
            name='fees',
            field=redactor.fields.RedactorField(null=True),
        ),
        migrations.AlterField(
            model_name='qualification',
            name='job_roles',
            field=redactor.fields.RedactorField(null=True),
        ),
        migrations.AlterField(
            model_name='qualification',
            name='packaging_rule',
            field=redactor.fields.RedactorField(null=True),
        ),
    ]
