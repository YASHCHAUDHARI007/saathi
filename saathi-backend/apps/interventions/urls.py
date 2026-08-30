from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InterventionViewSet, UpdateInterventionStatusView

router = DefaultRouter()
router.register(r'', InterventionViewSet, basename='interventions')

urlpatterns = [
    path('<str:intervention_id>/status/', UpdateInterventionStatusView.as_view(), name='intervention-update-status'),
    path('', include(router.urls)),
]
