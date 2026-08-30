from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Intervention
from .serializers import (
    InterventionSerializer,
    CreateInterventionSerializer,
    UpdateInterventionStatusSerializer,
)
from .services import InterventionService
from apps.cases.models import Case

class InterventionViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for protection and support interventions.
    """
    queryset = Intervention.objects.all().select_related('case', 'case__subject')
    serializer_class = InterventionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['case__id', 'type', 'status', 'priority']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = CreateInterventionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        case = get_object_or_404(Case, id=serializer.validated_data['case_id'])
        intervention = InterventionService.create_intervention(
            case=case,
            intervention_type=serializer.validated_data.get('type', 'Counselling'),
            title=serializer.validated_data['title'],
            description=serializer.validated_data.get('description', ''),
            priority=serializer.validated_data.get('priority', 'P2'),
            assigned_to_name=serializer.validated_data.get('assigned_to_name', ''),
            department=serializer.validated_data.get('department', 'District Legal Services Authority (DLSA)'),
            target_date=serializer.validated_data.get('target_date', ''),
            notes=serializer.validated_data.get('notes', ''),
            created_by=request.user
        )

        return Response({
            "success": True,
            "data": InterventionSerializer(intervention).data
        }, status=status.HTTP_201_CREATED)


class UpdateInterventionStatusView(APIView):
    """
    Update status of an existing intervention (e.g. In Progress, Completed).
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=UpdateInterventionStatusSerializer)
    def post(self, request, intervention_id):
        intervention = get_object_or_404(Intervention, id=intervention_id)
        serializer = UpdateInterventionStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated = InterventionService.update_status(
            intervention=intervention,
            new_status=serializer.validated_data['status'],
            notes=serializer.validated_data.get('notes', ''),
            updated_by=request.user
        )

        return Response({
            "success": True,
            "data": InterventionSerializer(updated).data
        })
