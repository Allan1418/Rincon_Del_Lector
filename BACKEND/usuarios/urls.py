# usuarios/urls.py
from django.urls import path
from . import views

app_name = "usuarios"

urlpatterns = [
    # Follow/Unfollow
    path('follow/<str:username>/', 
         views.UserRelationshipViewSet.as_view({'post': 'follow', 'delete': 'unfollow'})),
    
    # Following y followers
    path('following/', 
         views.UserRelationshipViewSet.as_view({'get': 'following_list'}), 
         name='following-list'),
    path('followers/', 
         views.UserRelationshipViewSet.as_view({'get': 'followers_list'}), 
         name='followers-list'),
    
    # Search y detalle
    path('search/', 
         views.UserSearchView.as_view(), 
         name='user-search'),
    path('<str:username>/', 
         views.UserRetrieveView.as_view(), 
         name='user-detail'),
]