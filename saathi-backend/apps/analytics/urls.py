from django.urls import path
from .views import (
    DistrictAnalyticsView,
    StateAnalyticsView,
    NationalOverviewView,
)

urlpatterns = [
    path('district/', DistrictAnalyticsView.as_view(), name='analytics-district'),
    path('state/', StateAnalyticsView.as_view(), name='analytics-state'),
    path('national/', NationalOverviewView.as_view(), name='analytics-national'),
]
