from rest_framework import generics, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import AIAnalysis
from .serializers import AIAnalysisSerializer

class CaseAIAnalysisListView(generics.ListAPIView):
    """
    List AI inference evaluations and audit results for a specific case.
    """
    serializer_class = AIAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs.get('case_id')
        return AIAnalysis.objects.filter(case_id=case_id).select_related(
            'distress_assessment',
            'emotion_assessment',
            'voice_stress_assessment',
            'audit_result'
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })


class InteractionAIAnalysisDetailView(generics.RetrieveAPIView):
    """
    Retrieve deep AI analysis breakdown for a single interaction.
    """
    serializer_class = AIAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        interaction_id = self.kwargs.get('interaction_id')
        return get_object_or_404(
            AIAnalysis.objects.select_related(
                'distress_assessment',
                'emotion_assessment',
                'voice_stress_assessment',
                'audit_result'
            ),
            interaction_id=interaction_id
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "data": serializer.data
        })
