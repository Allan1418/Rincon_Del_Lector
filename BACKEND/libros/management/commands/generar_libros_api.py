# libros/management/commands/generar_libros_api.py


import requests
from django.core.management.base import BaseCommand
from ...models import Libro
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import Image
import random
from datetime import date, timedelta
from django.contrib.auth import get_user_model
import uuid
import concurrent.futures
from faker import Faker
import re

User = get_user_model()
DEFAULT_PASSWORD = "asdfasdf666"
START_DATE = date(2023, 1, 1)
END_DATE = date(2025, 3, 30)
TARGET_BOOK_COUNT = 200
BOOKS_PER_QUERY = 40
MAX_WORKERS = 4
fake = Faker('es_ES')

def normalize_username(s):
    s = s.lower()
    s = re.sub(r'[^a-z0-9_]', '', s)
    return s

def process_image(image_url):
    try:
        response = requests.get(image_url, stream=True, timeout=10)
        response.raise_for_status()
        img = Image.open(response.raw)
        img = img.convert('RGB')

        img.thumbnail((400, 600), Image.Resampling.LANCZOS)

        output = BytesIO()
        img.save(output, format='WEBP', quality=80, optimize=True)
        output.seek(0)
        return output
    except Exception as e:
        print(f"Error procesando imagen {image_url}: {e}")
        return None

class Command(BaseCommand):
    help = 'Generador de libros y usuarios'

    def add_arguments(self, parser):
        parser.add_argument('--threads', type=int, default=MAX_WORKERS)

    def fetch_book_data(self, query):
        try:
            response = requests.get(
                f'https://www.googleapis.com/books/v1/volumes',
                params={
                    'q': query,
                    'maxResults': BOOKS_PER_QUERY,
                    'langRestrict': 'es'
                },
                timeout=15
            )
            response.raise_for_status()
            return response.json().get('items', [])
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error API: {e}'))
            return []

    def create_users_bulk(self, num_users):
        users = []
        existing = set(User.objects.values_list('username', flat=True))

        while len(users) < num_users:
            username = normalize_username(fake.user_name())[:30]
            if username not in existing and username:
                user = User(
                    username=username,
                    email=f'{username}@example.com',
                )
                user.set_password(DEFAULT_PASSWORD)
                users.append(user)
                existing.add(username)

        User.objects.bulk_create(users, ignore_conflicts=True, batch_size=50)
        return list(User.objects.filter(username__in=[u.username for u in users]))

    def assign_books_to_users(self, books):
        # Asigna 1-3 libros por usuario
        users = self.create_users_bulk(max(50, len(books) // 3))
        user_book_counts = {user.id: 0 for user in users}

        random.shuffle(books)

        for libro in books:
            candidates = [u for u in users if user_book_counts[u.id] < 3]
            if not candidates:
                candidates = users

            owner = random.choice(candidates)
            libro.owner = owner
            user_book_counts[owner.id] += 1

        Libro.objects.bulk_update(books, ['owner'])

    def handle(self, *args, **options):
        search_queries = ['ficción', 'novela', 'ciencia ficción', 'historia', 'arte', 'misterio', 'thriller', 'biografía', 'cocina', 'programación']
        books_to_create = []
        image_data = {}

        self.stdout.write(self.style.WARNING(f"Intentando obtener datos de la API para {TARGET_BOOK_COUNT} libros..."))

        with concurrent.futures.ThreadPoolExecutor(max_workers=options['threads']) as executor:
            future_to_query = {
                executor.submit(self.fetch_book_data, query): query
                for query in search_queries
            }

            for future in concurrent.futures.as_completed(future_to_query):
                items = future.result()
                for item in items:
                    if len(books_to_create) >= TARGET_BOOK_COUNT:
                        break

                    volume_info = item.get('volumeInfo', {})
                    title = volume_info.get('title')
                    synopsis = volume_info.get('description')

                    if title and title not in {b.title for b in books_to_create} and synopsis:
                        libro = Libro(
                            title=title[:200],
                            synopsis=synopsis[:1000],
                            price=random.choice([0.00] * 3 + [round(random.uniform(1000, 20000), 2)] * 7),
                            published_date=START_DATE + timedelta(
                                days=random.randint(0, (END_DATE - START_DATE).days)
                            )
                        )
                        books_to_create.append(libro)

                        if volume_info.get('imageLinks') and 'thumbnail' in volume_info['imageLinks']:
                            image_url = volume_info['imageLinks']['thumbnail'].replace('&zoom=1', '')
                            image_data[libro.title] = image_url
                if len(books_to_create) >= TARGET_BOOK_COUNT:
                    break

        self.stdout.write(self.style.WARNING(f"Se obtuvieron {len(books_to_create)} libros para crear."))

        if books_to_create:
            Libro.objects.bulk_create(books_to_create, batch_size=50, ignore_conflicts=True)
            created_books = list(Libro.objects.filter(title__in=[b.title for b in books_to_create]))
            self.stdout.write(self.style.SUCCESS(f"Se crearon {len(created_books)} libros en la base de datos."))

            self.stdout.write(self.style.WARNING("Descargando y asignando imagenes..."))
            created_books_by_title = {book.title: book for book in created_books}
            with concurrent.futures.ThreadPoolExecutor(max_workers=options['threads']) as executor:
                future_images = {
                    executor.submit(process_image, url): title
                    for title, url in image_data.items() if title in created_books_by_title
                }

                for future in concurrent.futures.as_completed(future_images):
                    title = future_images[future]
                    image_output = future.result()
                    if image_output and title in created_books_by_title:
                        libro = created_books_by_title[title]
                        try:
                            libro.image.save(f'{uuid.uuid4()}.webp', ContentFile(image_output.read()))
                            libro.save()
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f"Error al guardar la imagen para '{title}': {e}"))

            self.stdout.write(self.style.WARNING("Asignando libros a usuarios..."))
            self.assign_books_to_users(created_books)
            self.stdout.write(self.style.SUCCESS("Se asignaron libros a los usuarios."))

            self.stdout.write(self.style.SUCCESS(f'Proceso completado. Se generaron {len(created_books)} libros con {User.objects.count()} usuarios.'))
        else:
            self.stdout.write(self.style.WARNING("No se encontraron libros con sinopsis para crear."))