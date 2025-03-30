"""
URL configuration for api_core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from usuarios import views as usuariosViews
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

#from django.contrib.auth import views as auth_views

urlpatterns = [

    # Documentacion
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Admin
    path('admin/', admin.site.urls),

    # Autenticacion
    path('api/auth/', include('dj_rest_auth.urls')),  # Login, logout, etc.
    path('api/auth/registration/', 
         usuariosViews.CustomRegisterView.as_view(), name='rest_register'),  # Registro

    # Usuarios
    path('api/users/', include('usuarios.urls')),
    
    # Libros
    path('api/libros/', include('libros.urls')),
    
    # Carrito
    path('api/business/', include('business.urls')),



    #!!!__ULTIMOS__!!!
    # Redirect a docs
    path('', RedirectView.as_view(url='/api/schema/swagger-ui/')),
]
