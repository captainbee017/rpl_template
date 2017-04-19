# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2017-04-18 18:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bot', '0013_newslettterrequest_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='Testimonial',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dp', models.FileField(upload_to='docs/images/testimonials')),
                ('name', models.CharField(max_length=100)),
                ('designation', models.CharField(max_length=200)),
                ('message', models.TextField()),
            ],
        ),
        migrations.DeleteModel(
            name='Testimonials',
        ),
        migrations.AlterField(
            model_name='newslettterrequest',
            name='date',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
