from django.urls import path
from .views import (
    DepartmentIntegrationListView,
    IntegrationEventListView,
    SimulateDepartmentWebhookView,
)

urlpatterns = [
    path('departments/', DepartmentIntegrationListView.as_view(), name='integration-departments'),
    path('events/', IntegrationEventListView.as_view(), name='integration-events'),
    path('simulate-event/', SimulateDepartmentWebhookView.as_view(), name='integration-simulate-event'),
]
