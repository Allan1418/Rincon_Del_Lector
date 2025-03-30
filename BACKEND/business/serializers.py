# business/serializers.py

from rest_framework import serializers
from .models import Cart

class CartActionSerializer(serializers.Serializer):
    book_id = serializers.UUIDField(required=True)

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ['id']
        read_only_fields = ['id']