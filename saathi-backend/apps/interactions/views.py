import uuid
from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Interaction, ProcessingStatusChoices
from .serializers import (
    InteractionSerializer,
    CreateInteractionSerializer,
    CheckInSimulatorSerializer,
)
from .tasks import process_interaction_pipeline_task
from apps.cases.models import Case

class InteractionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve interactions across cases.
    """
    queryset = Interaction.objects.all().select_related('case', 'case__subject')
    serializer_class = InteractionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['case__id', 'channel', 'processing_status', 'threat_detected']

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


class SimulateCheckInView(APIView):
    """
    Submit a check-in / conversational response to trigger the real-time AI & Risk pipeline.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=CheckInSimulatorSerializer)
    def post(self, request):
        serializer = CheckInSimulatorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        case_id = serializer.validated_data['case_id']
        case = get_object_or_404(Case, id=case_id)

        interaction_id = f"INT-{uuid.uuid4().hex[:6].upper()}"
        interaction = Interaction.objects.create(
            id=interaction_id,
            case=case,
            channel=serializer.validated_data.get('channel', 'Chatbot'),
            direction='INBOUND',
            prompt_message="Automated wellbeing check-in pulse.",
            response_text=serializer.validated_data['response_text'],
            language=serializer.validated_data.get('language', 'en'),
            processing_status=ProcessingStatusChoices.PENDING
        )

        # Dispatch Celery task or process pipeline
        task_id = None
        try:
            res = process_interaction_pipeline_task(interaction.id)
            if isinstance(res, dict) and 'task_id' in res:
                task_id = res['task_id']
        except Exception:
            task_res = process_interaction_pipeline_task.delay(interaction.id)
            if hasattr(task_res, 'id'):
                task_id = str(task_res.id)

        # Refresh from database
        interaction.refresh_from_db()
        case.refresh_from_db()

        return Response({
            "success": True,
            "data": {
                "interaction": InteractionSerializer(interaction).data,
                "updatedDistressScore": case.distress_score,
                "updatedRiskLevel": case.risk_level,
                "task_id": task_id
            }
        }, status=status.HTTP_201_CREATED)


class AudioUploadInteractionView(APIView):
    """
    Upload voice recording for ASR and acoustic voice stress processing.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        case_id = request.data.get('case_id')
        audio_file = request.FILES.get('audio')
        channel = request.data.get('channel', 'IVRS')
        language = request.data.get('language', 'hi')

        case = get_object_or_404(Case, id=case_id)
        interaction_id = f"INT-{uuid.uuid4().hex[:6].upper()}"

        interaction = Interaction.objects.create(
            id=interaction_id,
            case=case,
            channel=channel,
            direction='INBOUND',
            audio_file=audio_file,
            language=language,
            processing_status=ProcessingStatusChoices.PENDING
        )

        process_interaction_pipeline_task.delay(interaction.id)
        interaction.refresh_from_db()

        return Response({
            "success": True,
            "data": InteractionSerializer(interaction).data
        }, status=status.HTTP_201_CREATED)
