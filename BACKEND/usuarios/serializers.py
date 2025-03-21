# usuarios/serializers.py
from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import UserDetailsSerializer
from dj_rest_auth.serializers import PasswordResetSerializer
from django.conf import settings
from django.db import IntegrityError
from django.contrib.auth import get_user_model

from django.utils.translation import gettext_lazy as _

User = get_user_model()

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "about", "image")  # Solo estos campos

class PublicShortUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'image')

class CustomRegisterSerializer(RegisterSerializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, email):
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("This email is already registered.")
        return email

    def custom_signup(self, request, user):
        pass  # Opcional: logica adicional durante el registro

    def save(self, request):
        try:
            return super().save(request)
        except IntegrityError as e:
            if 'usuarios_usuario_email_0a82e5f9_uniq' in str(e):
                raise serializers.ValidationError({"email": "This email is already registered."})
            raise serializers.ValidationError("Error registering user.")



class CustomLoginSerializer(serializers.Serializer):
    login = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        login = attrs.get("login")
        password = attrs.get("password")

        # Verificar si el login es un email o username
        is_email = "@" in login

        # Caso 1: Intento de login con email
        if is_email:
            try:
                user = User.objects.get(email=login)
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"login": _("No existe un usuario con este email.")}
                )
        # Caso 2: Intento de login con username
        else:
            try:
                user = User.objects.get(username=login)
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"login": _("No existe un usuario con este nombre.")}
                )

        # Verificar la credenciales
        if not user.check_password(password):
            raise serializers.ValidationError(
                {"password": _("credenciales incorrectas.")}
            )

        # Verificar si el usuario está activo
        if not user.is_active:
            raise serializers.ValidationError(
                {"login": _("Esta cuenta está desactivada.")}
            )

        attrs["user"] = user
        return attrs

from allauth.account.forms import ResetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from allauth.account.adapter import get_adapter
from allauth.account.utils import user_pk_to_url_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
class CustomPasswordResetSerializer(PasswordResetSerializer):
    def save(self):
        request = self.context.get('request')
        email = self.validated_data['email']
        
        form = ResetPasswordForm(data={'email': email})
        form.is_valid()
        users = form.users
        
        if users:
            user = users[0]
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = (
                f"{settings.FRONTEND_URL}/reset-password/"
                f"{uid}/{default_token_generator.make_token(user)}/"
            )
            
            get_adapter(request).send_mail(
                'account/email/password_reset_key',
                email,
                {
                    'user': user,
                    'request': request,
                    'reset_url': reset_url,
                }
            )

from dj_rest_auth.serializers import PasswordResetConfirmSerializer
from rest_framework.exceptions import ValidationError
class CustomPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password1 = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            uid = urlsafe_base64_decode(attrs['uid']).decode()
            self.user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise ValidationError({'uid': ['Invalid value']})

        if not default_token_generator.check_token(self.user, attrs['token']):
            raise ValidationError({'token': ['Invalid value']})

        if attrs['new_password1'] != attrs['new_password2']:
            raise serializers.ValidationError({"non_field_errors": ["Las contraseñas no coinciden"]})

        return attrs

    def save(self, **kwargs):
        self.user.set_password(self.validated_data['new_password1'])
        self.user.save()
        return self.user


class CustomUserDetailsSerializer(UserDetailsSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    about = serializers.CharField(allow_null=True, required=False)

    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + ("username", "about")
        read_only_fields = ()

    def validate_email(self, value):
        user = self.context['request'].user
        # Verifica que el nuevo email no exista en otros usuarios
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        # Verifica que el nuevo username no exista en otros usuarios
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya existe.")
        return value

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        instance.about = validated_data.get("about", instance.about)
        instance.save()
        return instance