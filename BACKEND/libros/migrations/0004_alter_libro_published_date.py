# Generated by Django 5.1.7 on 2025-04-01 04:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('libros', '0003_alter_purchase_purchase_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='libro',
            name='published_date',
            field=models.DateField(),
        ),
    ]
