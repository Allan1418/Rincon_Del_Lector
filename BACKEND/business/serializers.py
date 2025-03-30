# business/serializers.py

from rest_framework import serializers
from .models import Cart
from libros.models import Purchase

class CartActionSerializer(serializers.Serializer):
    book_id = serializers.UUIDField(required=True)

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ['id']
        read_only_fields = ['id']

class MonthlyEarningSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)

class OwnerEarningsSerializer(serializers.Serializer):
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_earnings = MonthlyEarningSerializer(many=True)

class PurchaseHistorySerializer(serializers.ModelSerializer):
    fecha = serializers.DateTimeField(source='purchase_date', read_only=True)
    titulo_libro = serializers.CharField(source='book.title', read_only=True)
    id_libro = serializers.UUIDField(source='book.id', read_only=True)
    precio = serializers.DecimalField(source='price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Purchase
        fields = ['fecha', 'titulo_libro', 'id_libro', 'precio']