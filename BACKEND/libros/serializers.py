# libros/serializers.py
from rest_framework import serializers
from .models import Libro

class LibroSerializer(serializers.ModelSerializer):
    is_owner = serializers.SerializerMethodField()
    is_purchased = serializers.SerializerMethodField()
    owner = serializers.CharField(source='owner.username', read_only=True)
    
    has_file = serializers.SerializerMethodField()
    has_image = serializers.SerializerMethodField()

    class Meta:
        model = Libro
        exclude = ['purchased_by', 'image', 'file']
        read_only_fields = ['id', 'published_date', 'owner']

    def get_is_owner(self, obj) -> bool:
        """Verifica si el usuario actual es el owner del libro"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.owner == request.user
        return False

    def get_is_purchased(self, obj) -> bool:
        """Verifica si el usuario actual ha comprado el libro"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.was_purchased_by(request.user)
        return False
    
    def get_has_file(self, obj) -> bool:
        """Verifica si el libro tiene un archivo EPUB asociado"""
        return bool(obj.file)

    def get_has_image(self, obj) -> bool:
        """Verifica si el libro tiene una imagen de portada"""
        return bool(obj.image)