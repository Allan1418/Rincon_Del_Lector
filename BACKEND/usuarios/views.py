# usuarios/views.py
from dj_rest_auth.registration.views import RegisterView
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import GenericViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
#from rest_framework import serializers as dj_serializers
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.http import FileResponse
from django.core.files.base import ContentFile
from django.db import IntegrityError
from .models import Usuario
from . import serializers
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes, extend_schema_view, OpenApiResponse#, OpenApiExample
import os
import io
import uuid
from PIL import Image




class CustomRegisterView(RegisterView):
    serializer_class = serializers.CustomRegisterSerializer


class UserRetrieveView(RetrieveAPIView):
    serializer_class = serializers.PublicUserSerializer
    permission_classes = [AllowAny]
    lookup_field = "username"
    queryset = Usuario.objects.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request_user'] = self.request.user
        return context

    def get(self, request, *args, **kwargs):
        self.usuario = self.get_object()
        return super().get(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user == self.usuario:
            return serializers.CustomUserDetailsSerializer
        
        return serializers.PublicUserSerializer


@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(
                name='q',
                description='Texto de busqueda para filtrar usuarios por nombre de usuario sin matchcase.',
                required=False,
                type=OpenApiTypes.STR,
            ),
        ]
    )
)
class UserSearchView(ListAPIView):
    serializer_class = serializers.PublicShortUserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        return Usuario.objects.filter(username__icontains=query)


class UserRelationshipViewSet(GenericViewSet):
    queryset = Usuario.objects.all()
    serializer_class = serializers.PublicShortUserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'

    @action(detail=True, methods=['post'])
    def follow(self, request, username=None):
        user_to_follow = get_object_or_404(Usuario, username=username)
        
        if request.user == user_to_follow:
            return Response(
                {'detail': 'No puedes seguirte a ti mismo'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if request.user.following.filter(pk=user_to_follow.pk).exists():
            return Response(
                {'detail': 'Ya sigues a este usuario'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        request.user.following.add(user_to_follow)
        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def unfollow(self, request, username=None):
        user_to_unfollow = get_object_or_404(Usuario, username=username)
        request.user.following.remove(user_to_unfollow)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def following_list(self, request):
        users = request.user.following.all()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def followers_list(self, request):
        users = request.user.followers.all()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)
    

@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(
                name='filename',
                description='Nombre único del archivo',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH
            )
        ],
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description="Imagen WEBP"
            ),
            404: OpenApiResponse(
                response=OpenApiTypes.STR,
                description="Error 404"
            )
        }
    )
)
class GetProfileImageView(APIView):
    def get(self, request, filename):
        safe_filename = os.path.basename(filename)
        file_path = os.path.join(settings.MEDIA_ROOT, 'profile_pics', safe_filename)
        
        if not os.path.isfile(file_path):
            return Response({'error': 'Imagen no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        return FileResponse(open(file_path, 'rb'), content_type='image/webp')
    

@extend_schema_view(
    post=extend_schema(
        request=serializers.FileUploadSerializer,
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.STR,
                description="Éxito"
            ),
            400: OpenApiResponse(
                response=OpenApiTypes.STR,
                description="Error"
            )
        }
    )
)
class UploadProfileImageView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # print("URL:", request.path)
        # print("Archivos recibidos:", request.FILES)
        # print("Datos POST:", request.POST)
        # print("Request:", request)
        # print("Request META:", request.META) 

        user = request.user
        uploaded_file = request.FILES.get('image')

        # Validar archivo
        if not uploaded_file:
            return Response({"error": "No se envio ninguna imagen"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not uploaded_file.content_type.startswith('image/'):
            return Response({"error": "El archivo no es una imagen"}, status=status.HTTP_400_BAD_REQUEST)

        # Procesar imagen
        try:
            # Procesar imagen...
            img = Image.open(uploaded_file)
            img = img.convert('RGB')
            
            output = io.BytesIO()
            img.save(output, format='WEBP', quality=40, optimize=True)
            output.seek(0)

            # Generar nuevo UUID y nombre
            new_uuid = uuid.uuid4().hex
            image_name = f"{new_uuid}.webp"

            # Eliminar imagen anterior si existe
            if user.image:
                user.image.delete(save=False)  # Elimina el archivo sin guardar el modelo

            # Asignar nueva imagen
            user.image.save(
                name=image_name,
                content=ContentFile(output.read()),
                save=False
            )
            user.image_name = image_name
            user.save()

            return Response({"image_name": user.image_name}, status=status.HTTP_200_OK)

        except IntegrityError:
            return Response(
                {"error": "Error inesperado. Intentalo de nuevo."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"error": f"Error procesando imagen: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )