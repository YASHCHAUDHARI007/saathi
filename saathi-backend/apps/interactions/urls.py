from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InteractionViewSet,
    SimulateCheckInView,
    AudioUploadInteractionView,
)

router = DefaultRouter()
router.register(r'', InteractionViewSet, basename='interactions')

urlpatterns = [
    path('simulate/', SimulateCheckInView.as_view(), name='interaction-simulate'),
    path('upload-audio/', AudioUploadInteractionView.as_view(), name='interaction-upload-audio'),
    path('', include(router.urls)),
]
