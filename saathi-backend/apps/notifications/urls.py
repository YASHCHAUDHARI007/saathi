from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .serializers import NotificationViewSet, MarkAllNotificationsReadView

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('mark-all-read/', MarkAllNotificationsReadView.as_view(), name='notifications-mark-all-read'),
    path('', include(router.urls)),
]
