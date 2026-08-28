from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .services import AnalyticsService
from .serializers import (
    DistrictMetricSerializer,
    StateMetricSerializer,
    NationalOverviewSerializer,
)

class DistrictAnalyticsView(APIView):
    """
    District-level distress metrics & geospatial coordinates.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        metrics = AnalyticsService.get_district_metrics()
        return Response({
            "success": True,
            "data": DistrictMetricSerializer(metrics, many=True).data
        })


class StateAnalyticsView(APIView):
    """
    State-level aggregated metrics and institutional KPIs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        metrics = AnalyticsService.get_state_metrics()
        return Response({
            "success": True,
            "data": StateMetricSerializer(metrics, many=True).data
        })


class NationalOverviewView(APIView):
    """
    National executive command overview for inter-agency coordination.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        overview = AnalyticsService.get_national_overview()
        return Response({
            "success": True,
            "data": NationalOverviewSerializer(overview).data
        })
