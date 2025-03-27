# usuarios/serializers.py
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import UserDetailsSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
from django.conf import settings
from django.db import IntegrityError
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.encoding import force_str
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema_field

from allauth.account.forms import ResetPasswordForm
from allauth.account.adapter import get_adapter
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class CustomUserDetailsSerializer(UserDetailsSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[validate_email]
    )
    username = serializers.CharField(
        required=True,
        validators=[UnicodeUsernameValidator()]
    )
    about = serializers.CharField(allow_null=True, required=False)

    followers_count = serializers.ReadOnlyField()
    following_count = serializers.ReadOnlyField()

    image_name = serializers.CharField(read_only=True)

    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + (
            "username", 
            "about",
            "followers_count",
            "following_count",
            "image_name"
        )
        read_only_fields = ('followers_count', 'following_count', 'image_name')

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


class PublicUserSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("username", 
                  "about", 
                  "image_name",
                  "followers_count", 
                  "following_count",
                  "is_following"
                )
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_following(self, obj):
        request_user = self.context.get('request_user')
        
        if request_user and request_user.is_authenticated:
            return obj.followers.filter(pk=request_user.pk).exists()
        
        return False


class PublicShortUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'image_name')


class CustomRegisterSerializer(RegisterSerializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, email):
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("This email is already registered.")
        return email

    def custom_signup(self, request, user):
        # Opcional: logica adicional durante el registro
        pass  

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

        # Verificar si el usuario esta activo
        if not user.is_active:
            raise serializers.ValidationError(
                {"login": ("Esta cuenta esta desactivada.")}
            )

        attrs["user"] = user
        return attrs


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


class CustomPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password1 = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uid']))
            self.user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise ValidationError({'uid': ['Invalid value']})

        if not default_token_generator.check_token(self.user, attrs['token']):
            raise ValidationError({'token': ['Invalid value']})

        if attrs['new_password1'] != attrs['new_password2']:
            raise serializers.ValidationError({"non_field_errors": ["Las passwords no coinciden"]})

         # Aplicar validadores de contraseña de Django
        try:
            validate_password(
                password=attrs['new_password1'],
                user=self.user
            )
        except DjangoValidationError as e:
            raise ValidationError({'new_password': e.messages})

        return attrs

    def save(self, **kwargs):
        self.user.set_password(self.validated_data['new_password1'])
        self.user.save()
        return self.user


class FileUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

