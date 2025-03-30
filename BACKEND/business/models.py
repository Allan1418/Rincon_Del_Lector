# business/models.py
from django.db import models
from django.contrib.auth import get_user_model
from libros.models import Libro, Purchase
from django.core.exceptions import ValidationError
import uuid

User = get_user_model()

class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total(self):
        return sum(item.book.price for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    book = models.ForeignKey(
        Libro,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'book')

    def clean(self):
        # Verifica si el usuario ya compro el libro
        if Purchase.objects.filter(user=self.cart.user, book=self.book).exists():
            raise ValidationError("Ya has comprado este libro anteriormente")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
