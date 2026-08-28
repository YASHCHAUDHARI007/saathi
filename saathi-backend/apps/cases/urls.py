from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CaseViewSet,
    CaseTimelineView,
    AssignCounsellorView,
    TriggerVictimSOSView,
)

router = DefaultRouter()
router.register(r'', CaseViewSet, basename='cases')

urlpatterns = [
    path('<str:case_id>/timeline/', CaseTimelineView.as_view(), name='case-timeline'),
    path('<str:case_id>/assign-counsellor/', AssignCounsellorView.as_view(), name='case-assign-counsellor'),
    path('<str:case_id>/sos/', TriggerVictimSOSView.as_view(), name='case-trigger-sos'),
    path('<str:case_id>/trigger-sos/', TriggerVictimSOSView.as_view(), name='case-trigger-sos-alias'),
    path('', include(router.urls)),
]
