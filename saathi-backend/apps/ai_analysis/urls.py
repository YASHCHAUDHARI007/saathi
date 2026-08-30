from django.urls import path
from .views import CaseAIAnalysisListView, InteractionAIAnalysisDetailView

urlpatterns = [
    path('case/<str:case_id>/', CaseAIAnalysisListView.as_view(), name='case-ai-analyses'),
    path('interaction/<str:interaction_id>/', InteractionAIAnalysisDetailView.as_view(), name='interaction-ai-analysis'),
]
