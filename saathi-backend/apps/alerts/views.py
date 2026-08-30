from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Alert
from .serializers import AlertSerializer, AlertActionSerializer
from .services import AlertService

class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve active and resolved vulnerability alerts.
    """
    queryset = Alert.objects.all().select_related('case', 'case__subject', 'case__district', 'case__state', 'assigned_to')
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['risk_level', 'status', 'case__id', 'case__district__name']

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


class AlertActionView(APIView):
    """
    Acknowledge or Resolve an alert.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=AlertActionSerializer)
    def post(self, request, alert_id):
        alert = get_object_or_404(Alert, id=alert_id)
        serializer = AlertActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        notes = serializer.validated_data.get('notes', '')

        if action == 'acknowledge':
            updated = AlertService.acknowledge_alert(alert, request.user)
        elif action == 'resolve':
            updated = AlertService.resolve_alert(alert, request.user, notes)
        else:
            return Response({"success": False, "error": {"message": "Invalid action"}}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "data": AlertSerializer(updated).data
        })
