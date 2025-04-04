# Generated by Django 5.1.7 on 2025-03-27 21:58

import django.db.models.deletion
import libros.models
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Libro',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('synopsis', models.TextField(blank=True, null=True)),
                ('price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('published_date', models.DateField(auto_now_add=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='books_images')),
                ('file', models.FileField(blank=True, null=True, upload_to='books_files')),
                ('owner', models.ForeignKey(default=libros.models.get_default_owner, on_delete=django.db.models.deletion.SET_DEFAULT, related_name='owned_books', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Purchase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('purchase_date', models.DateTimeField(auto_now_add=True)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='libros.libro')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'book')},
            },
        ),
        migrations.AddField(
            model_name='libro',
            name='purchased_by',
            field=models.ManyToManyField(blank=True, related_name='purchased_books', through='libros.Purchase', to=settings.AUTH_USER_MODEL),
        ),
    ]
