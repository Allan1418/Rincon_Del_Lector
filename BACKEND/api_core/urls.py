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
from usuarios import views as usuariosViews
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from django.contrib.auth import views as auth_views

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),  # Login, logout, etc.
    path('api/auth/registration/', 
         usuariosViews.CustomRegisterView.as_view(), name='rest_register'),  # Registro

    # Seguir a un usuario
    path('api/users/follow/<str:username>/', 
         usuariosViews.UserRelationshipViewSet.as_view({'post': 'follow'})),
    
    # Dejar de seguir
    path('api/users/follow/<str:username>/', 
         usuariosViews.UserRelationshipViewSet.as_view({'delete': 'unfollow'})),
    
    # Listar usuarios seguidos
    path('api/users/following/',
         usuariosViews.UserRelationshipViewSet.as_view({'get': 'following_list'})),
    
    # Listar seguidores
    path('api/users/followers/',
         usuariosViews.UserRelationshipViewSet.as_view({'get': 'followers_list'})),

    
    # Endpoint para buscar usuarios
    path("api/users/search/", 
         usuariosViews.UserSearchView.as_view(), name="user-search"),

    # Endpoint para obtener un usuario por username
    path("api/users/<str:username>/", 
         usuariosViews.UserRetrieveView.as_view(), name="user-detail"),
    
]
