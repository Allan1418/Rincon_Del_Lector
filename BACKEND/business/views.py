# business/views.py

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from libros.models import Libro, Purchase
from . import serializers
from django.db.models import Sum #, Count
from django.db import models

from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse #, OpenApiTypes, OpenApiParameter

class CartViewSet(viewsets.GenericViewSet):
    serializer_class = serializers.CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_object(self):
        return get_object_or_404(Cart, user=self.request.user)
    
    @extend_schema(
        description='Obtener el carrito actual del usuario con lista de IDs de libros',
        responses={
            200: OpenApiResponse(
                description='Carrito obtenido exitosamente',
                examples=[
                    OpenApiExample(
                        'Ejemplo respuesta',
                        value={
                            'id': '123e4567-e89b-12d3-a456-426614174000',
                            'libros': [
                                '123e4567-e89b-12d3-a456-426614174001',
                                '123e4567-e89b-12d3-a456-426614174002'
                            ]
                        }
                    )
                ]
            )
        }
    )
    def list(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        items = cart.items.all().values_list('book_id', flat=True)
        return Response({
            'total': cart.total,
            'libros': list(items)
        }, status=status.HTTP_200_OK)
    
    
    @extend_schema(
        methods=['POST'],
        description='Agregar un libro al carrito de compras',
        request=serializers.CartActionSerializer,
        responses={
            201: OpenApiResponse(
                description='Libro agregado exitosamente',
                examples=[
                    OpenApiExample(
                        'Respuesta exitosa',
                        value={'message': 'Libro agregado al carrito'}
                    )
                ]
            ),
            400: OpenApiResponse(
                description='Error en la solicitud',
                examples=[
                    OpenApiExample(
                        'Error de validación',
                        value={
                            'error': 'No puedes agregar tu propio libro'
                        }
                    )
                ]
            ),
            404: OpenApiResponse(
                description='Libro no encontrado',
                examples=[
                    OpenApiExample(
                        'No encontrado',
                        value={'error': 'Libro no encontrado'}
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                'Ejemplo solicitud',
                value={'book_id': '123e4567-e89b-12d3-a456-426614174000'},
                request_only=True
            )
        ]
    )
    @action(detail=False, methods=['post'])
    def agregar(self, request):
        
        serializer = serializers.CartActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        book_id = serializer.validated_data['book_id']
        cart = self.get_object()
        
        if not book_id:
            return Response({'error': 'Se requiere book_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            libro = Libro.objects.get(pk=book_id)
        except Libro.DoesNotExist:
            return Response({'error': 'Libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        if libro.owner == request.user:
            return Response({'error': 'No puedes agregar tu propio libro'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Purchase.objects.filter(user=request.user, book=libro).exists():
            return Response({'error': 'Ya posees este libro'}, status=status.HTTP_400_BAD_REQUEST)
        
        if CartItem.objects.filter(cart=cart, book=libro).exists():
            return Response({'error': 'El libro ya esta en el carrito'}, status=status.HTTP_400_BAD_REQUEST)
        
        CartItem.objects.create(cart=cart, book=libro)
        return Response({'message': 'Libro agregado al carrito'}, status=status.HTTP_201_CREATED)


    @extend_schema(
        methods=['DELETE'],
        description='Remover un libro del carrito de compras',
        request=serializers.CartActionSerializer,
        responses={
            200: OpenApiResponse(
                description='Libro removido exitosamente',
                examples=[
                    OpenApiExample(
                        'Respuesta exitosa',
                        value={'message': 'Libro removido del carrito'}
                    )
                ]
            ),
            404: OpenApiResponse(
                description='Libro no encontrado en el carrito',
                examples=[
                    OpenApiExample(
                        'No encontrado',
                        value={'error': 'Libro no encontrado en el carrito'}
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                'Ejemplo solicitud',
                value={'book_id': '123e4567-e89b-12d3-a456-426614174000'},
                request_only=True
            )
        ]
    )
    @action(detail=False, methods=['delete'])
    def quitar(self, request):
        cart = self.get_object()
        book_id = request.data.get('book_id')
        
        serializer = serializers.CartActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        book_id = serializer.validated_data['book_id']
        
        if not book_id:
            return Response({'error': 'Se requiere book_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        item = get_object_or_404(CartItem, cart=cart, book_id=book_id)
        item.delete()
        return Response({'message': 'Libro removido del carrito'}, status=status.HTTP_200_OK)
    
    
    @extend_schema(
        methods=['POST'],
        description='Realizar compra de los libros en el carrito',
        responses={
            200: OpenApiResponse(
                description='Compra realizada exitosamente',
                examples=[
                    OpenApiExample(
                        'Respuesta exitosa',
                        value={
                            'message': 'Compra realizada exitosamente',
                            'libros_comprados': [
                                '123e4567-e89b-12d3-a456-426614174000',
                                '123e4567-e89b-12d3-a456-426614174001'
                            ]
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description='Error en la compra',
                examples=[
                    OpenApiExample(
                        'Carrito vacío',
                        value={'error': 'El carrito está vacío'}
                    ),
                    OpenApiExample(
                        'Errores de validación',
                        value={
                            'errors': [
                                "No puedes comprar tu propio libro: El Gran Libro",
                                "Ya posees este libro: Aprendiendo Python"
                            ]
                        }
                    )
                ]
            )
        }
    )
    @action(detail=False, methods=['post'])
    def comprar(self, request):
        cart = self.get_object()
        items = cart.items.all()
        
        if not items.exists():
            return Response({'error': 'El carrito esta vacio'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar todos los items antes de comprar
        errors = []
        for item in items:
            if item.book.owner == request.user:
                errors.append(f"No puedes comprar tu propio libro: {item.book.title}")
            if Purchase.objects.filter(user=request.user, book=item.book).exists():
                errors.append(f"Ya posees este libro: {item.book.title}")
        
        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear las compras
        purchased_books_ids = []
        for item in items:
            purchase = Purchase(user=request.user, book=item.book)
            purchase.save()
            purchased_books_ids.append(item.book.id)
        
        # Vaciar carrito
        items.delete()
        
        return Response({
            'message': 'Compra realizada exitosamente',
            'libros_comprados': purchased_books_ids
        }, status=status.HTTP_200_OK)



class OwnerEarningsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.OwnerEarningsSerializer

    def get(self, request):
        user = request.user
        
        purchases = Purchase.objects.filter(book__owner=user)
        
        # Calculo del total
        total_earnings = purchases.aggregate(
            total=Sum('price')
        )['total'] or 0.00

        # Calculo por mes
        monthly_earnings = purchases.annotate(
            year=models.functions.ExtractYear('purchase_date'),
            month=models.functions.ExtractMonth('purchase_date')
        ).values('year', 'month').annotate(
            total=Sum('price')
        ).order_by('year', 'month')

        # Formateo de la respuesta
        formatted_monthly = [
            {
                'year': entry['year'],
                'month': entry['month'],
                'total': entry['total']
            }
            for entry in monthly_earnings
        ]
        
        response_data = {
            'total_earnings': total_earnings,
            'monthly_earnings': formatted_monthly
        }
        
        serializer = serializers.OwnerEarningsSerializer(data=response_data)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class PurchaseHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.PurchaseHistorySerializer
    pagination_class = PageNumberPagination
    
    def get(self, request):
        user = request.user
        purchases = Purchase.objects.filter(user=user).select_related('book').order_by('-purchase_date')
        
        # Paginar el queryset
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(purchases, request)
        
        # Serializar la pagina actual
        serializer = serializers.PurchaseHistorySerializer(page, many=True)
        
        # Devolver respuesta paginada
        return paginator.get_paginated_response(serializer.data)