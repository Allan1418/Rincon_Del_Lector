from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from drf_spectacular.utils import extend_schema_field
from rest_framework.serializers import IntegerField



class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El Email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    about = models.TextField(blank=True, null=True)

    image = models.ImageField(
        upload_to='profile_pics',
        blank=True,
        null=True,
        verbose_name='Imagen de perfil'
    )
    image_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        editable=False,
        unique=True
    )

    following = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='followers',
        blank=True
    )

    @property
    @extend_schema_field(IntegerField)
    def followers_count(self):
        return self.followers.count()

    @property
    @extend_schema_field(IntegerField)
    def following_count(self):
        return self.following.count()

    objects = UsuarioManager()

    

    

