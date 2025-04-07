# libros/views.py
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Libro
from .serializers import LibroSerializer
from django.contrib.auth import get_user_model
from django.db import models
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse, OpenApiTypes

from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from PIL import Image
from django.core.files.base import ContentFile
from django.http import FileResponse
from .helpers import is_epub_file
import io
import os

User = get_user_model()


class IsOwner(permissions.BasePermission):
    """Permiso personalizado para que solo el owner pueda modificar"""

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class LibroViewSet(viewsets.ModelViewSet):
    queryset = Libro.objects.all()
    serializer_class = LibroSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly & IsOwner]
    
    def get_permissions(self):
        if self.action == 'retrieve':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_serializer_context(self):
        """el request en el contexto del serializer"""
        return {'request': self.request}

    def perform_create(self, serializer):
        """Al crear, se asigna auto el owner"""
        serializer.save(owner=self.request.user)

    @extend_schema(
        summary="Lista de libros",
        description="""
        Obtiene una lista paginada de libros con múltiples opciones de filtrado y ordenamiento.
        """,
        parameters=[
            OpenApiParameter(
                name='owned',
                description='Filtra libros propiedad del usuario autenticado',
                required=False,
                type=bool,
                examples=[
                    OpenApiExample(
                        'Ejemplo true',
                        summary='Solo mis libros',
                        value='true'
                    ),
                ]
            ),
            OpenApiParameter(
                name='purchased',
                description='Filtra libros comprados por el usuario autenticado',
                required=False,
                type=bool,
                examples=[
                    OpenApiExample(
                        'Ejemplo true',
                        summary='Libros comprados',
                        value='true'
                    ),
                ]
            ),
            OpenApiParameter(
                name='search',
                description='Busqueda por titulo o sinopsis',
                required=False,
                type=str,
                examples=[
                    OpenApiExample(
                        'Busqueda por palabra clave',
                        value='The Witcher'
                    ),
                ]
            ),
            OpenApiParameter(
                name='owner',
                description='Busqueda por username',
                required=False,
                type=str,
                examples=[
                    OpenApiExample(
                        'Busqueda por palabra clave',
                        value='juanPerez22'
                    ),
                ]
            ),
            OpenApiParameter(
                name='ordering',
                description='Ordenamiento de resultados',
                required=False,
                type=str,
                enum=[
                    'title', '-title', 
                    'price', '-price',
                    'published_date', '-published_date',
                    'most_purchased', 'least_purchased'
                ],
                examples=[
                    OpenApiExample(
                        'Más vendidos primero',
                        value='most_purchased'
                    ),
                    OpenApiExample(
                        'Precio ascendente',
                        value='price'
                    ),
                    OpenApiExample(
                        'Más recientes primero',
                        value='-published_date'
                    ),
                ]
            ),
        ],
        examples=[
            OpenApiExample(
                'Ejemplo completo',
                value={
                    "owned": "true",
                    "search": "Wild Cards",
                    "ordering": "most_purchased"
                },
                description='Combina múltiples parámetros',
                parameter_only=True
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        # Anotar compras desde el principio
        queryset = self.get_queryset().annotate(purchase_count=models.Count("purchased_by", distinct=True))

        if request.user.is_authenticated:
            # Parametro para libros owned
            if request.query_params.get('owned') == 'true':
                queryset = queryset.filter(owner=request.user)
            elif request.query_params.get('owned') == 'false':
                queryset = queryset.exclude(owner=request.user)
        
            # Parametro para libros comprados
            if request.query_params.get('purchased') == 'true':
                queryset = queryset.filter(purchased_by=request.user)
            elif request.query_params.get('purchased') == 'false':
                queryset = queryset.exclude(purchased_by=request.user)

        # Busqueda
        search_term = request.query_params.get("search")
        if search_term:
            queryset = queryset.filter(
                models.Q(title__icontains=search_term)
                |
                models.Q(synopsis__icontains=search_term)
            )
        
        # Busqueda por owner username
        owner_username = request.query_params.get("owner")
        if owner_username:
            queryset = queryset.filter(owner__username__icontains=owner_username)

        # Ordenamiento
        ordering = request.query_params.get("ordering")
        valid_ordering = [
            "title",
            "-title",
            "price",
            "-price",
            "published_date",
            "-published_date",
            "most_purchased",
            "least_purchased",
        ]

        if ordering in valid_ordering:
            if ordering == "most_purchased":
                queryset = queryset.order_by("-purchase_count")
            elif ordering == "least_purchased":
                queryset = queryset.order_by("purchase_count")
            else:
                queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("-published_date")

        # print("\nSQL FINAL: ", queryset.query)

        # Paginacion
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    

    @extend_schema(
    methods=['POST'],
    summary="Subir imagen del libro",
    description="Sube una imagen para el libro",
    responses={
        200: OpenApiResponse(description="Imagen actualizada"),
        403: OpenApiResponse(description="No eres el owner"),
        400: OpenApiResponse(description="Error en la imagen"),
        404: OpenApiResponse(description="Libro no encontrado")
    }
    )
    @action(
        detail=True,
        methods=['POST'],
        parser_classes=[MultiPartParser],
        permission_classes=[permissions.IsAuthenticated]
    )
    def upload_image(self, request, pk=None):
        libro = self.get_object()
        
        # Verificar que el usuario es el owner
        if libro.owner != request.user:
            return Response(
                {"detail": "Solo el owner puede subir imagenes"},
                status=status.HTTP_403_FORBIDDEN
            )

        uploaded_file = request.FILES.get('image')
        
        # Validar archivo
        if not uploaded_file:
            return Response({"error": "No se envio ninguna imagen"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not uploaded_file.content_type.startswith('image/'):
            return Response({"error": "El archivo no es una imagen"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Procesar imagen
            img = Image.open(uploaded_file)
            img = img.convert('RGB')
            
            # Optimizar y convertir a WEBP
            output = io.BytesIO()
            img.save(output, format='WEBP', quality=70, optimize=True)
            output.seek(0)

            # Generar nombre usando UUID del libro
            image_name = f"{libro.id}.webp"

            # Eliminar imagen anterior si existe
            if libro.image:
                libro.image.delete(save=False)

            # Guardar nueva imagen
            libro.image.save(
                name=image_name,
                content=ContentFile(output.read()),
                save=True
            )

            return Response({
                "message": "Imagen actualizada exitosamente"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error procesando imagen: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


    @extend_schema(
    methods=['GET'],
    summary="Obtener imagen del libro",
    description="Descarga la imagen del libro en formato WEBP",
    responses={
            (200, 'image/webp'): 
            OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description="Imagen WEBP"
            ),
            404: OpenApiResponse(
                response=OpenApiTypes.STR,
                description="Imagen no encontrada"
            )
        }
    )
    @action(detail=True, 
            methods=['GET'],
            permission_classes=[]
    )
    def get_image(self, request, pk=None):
        libro = self.get_object()
        
        if not libro.image:
            return Response(
                {"detail": "Este libro no tiene imagen"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verificar que el archivo existe físicamente
        file_path = libro.image.path
        if not os.path.isfile(file_path):
            return Response(
                {"error": "Imagen no encontrada en el servidor"},
                status=status.HTTP_404_NOT_FOUND
            )

        return FileResponse(open(file_path, 'rb'), content_type='image/webp')

    @extend_schema(
    methods=['POST'],
    summary="Subir archivo EPUB del libro",
    description="Sube el archivo EPUB del libro (solo owner)",
    responses={
        200: OpenApiResponse(description="Archivo actualizado"),
        403: OpenApiResponse(description="No eres el owner"),
        400: OpenApiResponse(description="Archivo inválido"),
    }
    )
    @action(
        detail=True,
        methods=['POST'],
        parser_classes=[MultiPartParser],
        permission_classes=[permissions.IsAuthenticated],
        #serializer_class=LibroFileSerializer
    )
    def upload_file(self, request, pk=None):
        libro = self.get_object()
        
        # Verificar que el usuario es el owner
        if libro.owner != request.user:
            return Response(
                {"detail": "Solo el owner puede subir archivos"},
                status=status.HTTP_403_FORBIDDEN
            )

        uploaded_file = request.FILES.get('file')
        
        # Validar archivo
        if not uploaded_file:
            return Response({"error": "No se envio ningun archivo"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar EPUB
        if not uploaded_file.name.lower().endswith('.epub') or not is_epub_file(uploaded_file):
            return Response(
                {"error": "Solo se permiten archivos EPUB"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Generar nombre usando UUID del libro
            file_name = f"{libro.id}.epub"

            # Eliminar archivo anterior si existe
            if libro.file:
                libro.file.delete(save=False)

            # Guardar nuevo archivo
            libro.file.save(
                name=file_name,
                content=uploaded_file,
                save=True
            )

            return Response({
                "message": "Archivo actualizado exitosamente"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error procesando archivo: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


    @extend_schema(
    methods=['GET'],
    summary="Descargar archivo EPUB",
    description="Descarga el archivo EPUB (dueño o compradores)",
    responses={
        (200, 'file/epub'): 
            OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description="Archivo Epub"
        ),
        403: OpenApiResponse(description="Acceso denegado"),
        404: OpenApiResponse(description="Archivo no encontrado")
    }
    )
    @action(detail=True, 
            methods=['GET'],
            permission_classes=[permissions.IsAuthenticated],
    )
    def get_file(self, request, pk=None):
        libro = self.get_object()
        
        # Verificar permisos: owner o usuario que compro el libro
        if not (request.user == libro.owner or libro.was_purchased_by(request.user)):
            return Response(
                {"detail": "No tienes permiso para acceder a este archivo"},
                status=status.HTTP_403_FORBIDDEN
            )

        if not libro.file:
            return Response(
                {"detail": "Este libro no tiene archivo asociado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verificar que el archivo existe
        file_path = libro.file.path
        if not os.path.isfile(file_path):
            return Response(
                {"error": "Archivo no encontrado en el servidor"},
                status=status.HTTP_404_NOT_FOUND
            )

        return FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=f"{libro.title}.epub",
            content_type='application/epub+zip'
        )

    @extend_schema(
    summary="Libros por usuario exacto",
    description="Obtiene libros de un usuario por username especifico",
    parameters=[
        OpenApiParameter(
            name='username',
            description='username de usuario EXACTO',
            required=True,
            type=str,
            location=OpenApiParameter.PATH,
            examples=[
                OpenApiExample(
                    'Ejemplo usuario exacto',
                    value='juan27'
                ),
            ]
        ),
    ],
    responses={
        200: OpenApiResponse(response=LibroSerializer(many=True)),
        404: OpenApiResponse(description="Usuario no encontrado")
    }
    )
    @action(
        detail=False,
        methods=['GET'],
        url_path='owner/(?P<username>[^/.]+)',
        permission_classes=[permissions.AllowAny]
    )
    def list_by_exact_owner(self, request, username=None):
        
        # Endpoint: /api/libros/owner/<username>/
        
        try:
            user = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        queryset = self.get_queryset().filter(owner=user)
        queryset = self.filter_queryset(queryset)
        queryset = queryset.order_by("-published_date")
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)