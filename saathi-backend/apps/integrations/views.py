from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import DepartmentIntegration, IntegrationEvent
from .serializers import (
    DepartmentIntegrationSerializer,
    IntegrationEventSerializer,
    IngestSimulatedEventSerializer,
)
from .simulator import DepartmentSimulatorService
from apps.cases.models import Case

class DepartmentIntegrationListView(generics.ListAPIView):
    """
    List government inter-agency integration channels and sync statuses.
    """
    queryset = DepartmentIntegration.objects.all()
    serializer_class = DepartmentIntegrationSerializer
    permission_classes = [permissions.IsAuthenticated]


class IntegrationEventListView(generics.ListAPIView):
    """
    List events received from external agencies.
    """
    serializer_class = IntegrationEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.request.query_params.get('case_id')
        qs = IntegrationEvent.objects.all().select_related('department', 'case')
        if case_id:
            qs = qs.filter(case_id=case_id)
        return qs


class SimulateDepartmentWebhookView(APIView):
    """
    Simulate an external agency webhook event (eCourts bail hearing, CCTNS charge-sheet, Social Justice DBT).
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=IngestSimulatedEventSerializer)
    def post(self, request):
        serializer = IngestSimulatedEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        case = get_object_or_404(Case, id=serializer.validated_data['case_id'])
        event = DepartmentSimulatorService.ingest_event(
            case=case,
            event_code=serializer.validated_data['event_code'],
            custom_summary=serializer.validated_data.get('summary')
        )

        return Response({
            "success": True,
            "data": {
                "event": IntegrationEventSerializer(event).data,
                "updatedDistressScore": case.distress_score,
                "currentStage": case.current_stage
            }
        }, status=status.HTTP_201_CREATED)
