from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import LongitudinalMetric, RiskAssessment, ContributingFactorItem
from .serializers import (
    LongitudinalMetricSerializer,
    RiskAssessmentSerializer,
    ContributingFactorSerializer,
)

class CaseLongitudinalTrajectoryView(generics.ListAPIView):
    """
    Retrieve chronological multi-week distress trajectory for graphs.
    """
    serializer_class = LongitudinalMetricSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs.get('case_id')
        return LongitudinalMetric.objects.filter(case_id=case_id).order_by('recorded_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })


class CaseContributingFactorsView(generics.ListAPIView):
    """
    Retrieve point-decomposed explainability factors for a case.
    """
    serializer_class = ContributingFactorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs.get('case_id')
        return ContributingFactorItem.objects.filter(case_id=case_id).order_by('-points')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })
