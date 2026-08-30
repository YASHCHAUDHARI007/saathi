from django.urls import path
from .views import CaseLongitudinalTrajectoryView, CaseContributingFactorsView

urlpatterns = [
    path('case/<str:case_id>/trajectory/', CaseLongitudinalTrajectoryView.as_view(), name='case-trajectory'),
    path('case/<str:case_id>/factors/', CaseContributingFactorsView.as_view(), name='case-factors'),
]
