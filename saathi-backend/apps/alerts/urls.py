from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlertViewSet, AlertActionView

router = DefaultRouter()
router.register(r'', AlertViewSet, basename='alerts')

urlpatterns = [
    path('<str:alert_id>/action/', AlertActionView.as_view(), name='alert-action'),
    path('', include(router.urls)),
]
