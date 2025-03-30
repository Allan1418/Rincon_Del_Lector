# business/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OwnerEarningsView, PurchaseHistoryView

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
    path('owner-earnings/', OwnerEarningsView.as_view(), name='owner-earnings'),
    path('purchase-history/', PurchaseHistoryView.as_view(), name='purchase-history'),
]