from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema

from .models import Case, CaseEvent, Subject
from .serializers import (
    CaseListSerializer,
    CaseDetailSerializer,
    CaseEventSerializer,
    AssignCounsellorSerializer,
    TriggerSOSSerializer,
)
from .services import CaseService
from apps.accounts.models import User, RoleChoices
from apps.accounts.permissions import HasCaseAccess

class CaseViewSet(viewsets.ModelViewSet):
    """
    CRUD and querying endpoint for Cases with RBAC and filtering.
    """
    queryset = Case.objects.all().select_related('subject', 'district', 'state', 'assigned_counsellor')
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['risk_level', 'current_stage', 'monitoring_status', 'priority', 'district__name', 'case_type']
    search_fields = ['id', 'subject__anonymous_id', 'case_type', 'fir_number', 'district__name']
    ordering_fields = ['distress_score', 'updated_at', 'created_at']
    ordering = ['-distress_score']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.is_superuser or user.role == RoleChoices.NATIONAL_ADMIN:
            return qs

        if user.role == RoleChoices.STATE_ADMIN and user.state:
            return qs.filter(state=user.state)

        if user.role == RoleChoices.DISTRICT_OFFICER and user.district:
            return qs.filter(district=user.district)

        if user.role == RoleChoices.COUNSELLOR:
            return qs.filter(assigned_counsellor=user) | qs.filter(district=user.district)

        if user.role == RoleChoices.VICTIM_CITIZEN:
            return qs.filter(subject__user=user)

        return qs

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return CaseDetailSerializer
        return CaseListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "count": queryset.count(),
            "data": serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "data": serializer.data
        })


class CaseTimelineView(generics.ListAPIView):
    """
    Retrieve audit-grade chronological timeline events for a case.
    """
    serializer_class = CaseEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs.get('case_id')
        return CaseEvent.objects.filter(case_id=case_id).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        events = self.get_queryset()
        serializer = self.get_serializer(events, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })


class AssignCounsellorView(APIView):
    """
    Assign or update the dedicated counsellor for a case.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=AssignCounsellorSerializer)
    def post(self, request, case_id):
        case = get_object_or_404(Case, id=case_id)
        serializer = AssignCounsellorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        counsellor_id = serializer.validated_data.get('counsellor_id')
        counsellor_name = serializer.validated_data.get('counsellor_name')
        phone = serializer.validated_data.get('phone', '')

        if counsellor_id:
            counsellor = get_object_or_404(User, id=counsellor_id)
        elif counsellor_name:
            counsellor = User.objects.filter(
                role=RoleChoices.COUNSELLOR
            ).first()
            if not counsellor:
                counsellor = User.objects.create(
                    username=counsellor_name.lower().replace(' ', '_'),
                    first_name=counsellor_name,
                    role=RoleChoices.COUNSELLOR,
                    phone_number=phone or "+91 98230 44102"
                )
        else:
            return Response(
                {"success": False, "error": {"message": "Counsellor identifier required."}},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_case = CaseService.assign_counsellor(
            case=case,
            counsellor=counsellor,
            phone=phone,
            assigned_by=request.user
        )

        return Response({
            "success": True,
            "data": CaseDetailSerializer(updated_case).data
        })


class TriggerVictimSOSView(APIView):
    """
    Victim portal emergency distress / SOS trigger.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=TriggerSOSSerializer)
    def post(self, request, case_id):
        case = get_object_or_404(Case, id=case_id)
        serializer = TriggerSOSSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event = CaseService.trigger_victim_sos(
            case=case,
            threat_details=serializer.validated_data['threat_details'],
            location=serializer.validated_data.get('location', 'Mobile App GPS'),
            triggered_by=request.user if request.user.is_authenticated else None
        )

        return Response({
            "success": True,
            "data": {
                "eventId": str(event.id),
                "caseId": case.id,
                "status": "EMERGENCY_DISPATCH_TRIGGERED",
                "distressScore": case.distress_score,
                "riskLevel": case.risk_level
            }
        })
