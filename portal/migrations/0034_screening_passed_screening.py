# Generated by Django 5.2.1 on 2025-06-17 11:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0033_alter_application_profile_picture_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='screening',
            name='passed_screening',
            field=models.BooleanField(default=False),
        ),
    ]
