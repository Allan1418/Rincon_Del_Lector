# Generated by Django 5.1.7 on 2025-03-26 01:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='image_name',
            field=models.CharField(blank=True, editable=False, max_length=255, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pics', verbose_name='Imagen de perfil'),
        ),
    ]
