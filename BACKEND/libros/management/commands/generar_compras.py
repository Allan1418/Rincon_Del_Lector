# libros/management/commands/generar_compras.py


from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from ...models import Libro, Purchase
import random
from datetime import date, timedelta, datetime
from django.utils import timezone
import factory
from factory.django import DjangoModelFactory
from django.db import IntegrityError, transaction

User = get_user_model()
PURCHASE_START_DATE = date(2023, 1, 1)
PURCHASE_END_DATE = date(2025, 3, 30)
DEFAULT_PASSWORD = 'asdfasdf666'
NUM_USUARIOS = 2000
MIN_COMPRAS = 0
MAX_COMPRAS = 10

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Faker('user_name')
    email = factory.Faker('email')

class Command(BaseCommand):
    help = 'Genera usuarios y compras de manera optimizada'

    def handle(self, *args, **options):
        # Pre-calculo de valores constantes
        start_date = PURCHASE_START_DATE
        end_date = PURCHASE_END_DATE
        days_between_dates = (end_date - start_date).days
        all_books = list(Libro.objects.all())
        current_timezone = timezone.get_current_timezone()

        if not all_books:
            self.stdout.write(self.style.WARNING('No hay libros disponibles. Genera libros primero.'))
            return

        self.stdout.write(f'Generando {NUM_USUARIOS} usuarios...')
        usuarios_creados = 0
        
        # Prepara todas las operaciones de base de datos en lotes
        while usuarios_creados < NUM_USUARIOS:
            try:
                with transaction.atomic():
                    # Crear usuario con password
                    user = UserFactory.build()
                    user.set_password(DEFAULT_PASSWORD)
                    user.save()
                    usuarios_creados += 1
                    self.stdout.write(self.style.SUCCESS(f'Usuario "{user.username}" creado.'))

                    # Generar compras
                    num_compras = random.randint(MIN_COMPRAS, MAX_COMPRAS)
                    available_books = len(all_books)
                    if available_books == 0:
                        continue
                    
                    num_compras = min(num_compras, available_books)
                    if num_compras == 0:
                        continue
                    
                    # Seleccion unica de libros y generacion de compras
                    selected_books = random.sample(all_books, num_compras)
                    purchases = []
                    
                    for book in selected_books:
                        random_days = random.randint(0, days_between_dates)
                        purchase_date = start_date + timedelta(days=random_days)
                        purchase_datetime = timezone.make_aware(
                            datetime.combine(purchase_date, datetime.min.time()),
                            current_timezone
                        )
                        purchases.append(Purchase(
                            user=user,
                            book=book,
                            purchase_date=purchase_datetime,
                            price=book.price
                        ))
                        try:
                            user.following.add(book.owner)
                        except Exception:
                            continue
                    
                    user.save()

                    # Creacion masiva de compras
                    Purchase.objects.bulk_create(purchases)
                    self.stdout.write(
                        self.style.SUCCESS(f'Creadas {len(purchases)} compras para {user.username}')
                    )

            except IntegrityError as e:
                if 'username' in str(e):
                    self.stdout.write(self.style.WARNING('Usuario duplicado, reintentando...'))
                else:
                    self.stderr.write(self.style.ERROR(f'Error de integridad: {e}'))
                continue

            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Error inesperado: {e}'))
                continue

        self.stdout.write(self.style.SUCCESS(f'Proceso completado. Total usuarios: {usuarios_creados}'))