# libros/models.py
from django.db import models
from django.contrib.auth import get_user_model
import uuid
from django.utils import timezone

User = get_user_model()


def get_default_owner():
    try:
        user = User.objects.get(username='default_owner')
        return user.pk
    except User.DoesNotExist:
        user = User.objects.create_user(username='default_owner', email='default@example.com', password='password')
        return user.pk

class Libro(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    synopsis = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    published_date = models.DateField()
    owner = models.ForeignKey(User, on_delete=models.SET_DEFAULT, related_name='owned_books', default=get_default_owner)
    
    # Campos para la imagen
    image = models.ImageField(
        upload_to='books_images',
        blank=True,
        null=True)
    
    # Campos para el archivo
    file = models.FileField(
        upload_to='books_files',
        blank=True,
        null=True)
    
    # Relacion de usuarios que compraron el libro
    purchased_by = models.ManyToManyField(
        User,
        through='Purchase',
        related_name='purchased_books',
        blank=True
    )

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.published_date:
            self.published_date = timezone.now().date()
        
        super().save(*args, **kwargs)
    
    def was_purchased_by(self, user):
        return self.purchased_by.filter(pk=user.pk).exists()


class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Libro, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f'{self.user} - {self.book}'
    
    def save(self, *args, **kwargs):
        if not self.purchase_date:
            self.purchase_date = timezone.now()
        
        self.price = self.book.price
        super().save(*args, **kwargs)