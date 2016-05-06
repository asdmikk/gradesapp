# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-05-06 07:26
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('gapp', '0003_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='grade',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='gapp.User'),
        ),
        migrations.AlterField(
            model_name='user',
            name='student_code',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]