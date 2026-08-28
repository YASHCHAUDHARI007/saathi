from rest_framework import serializers
from .models import Interaction
from apps.cases.models import Case

class InteractionSerializer(serializers.ModelSerializer):
    case_id = serializers.CharField(source='case.id', read_only=True)
    anonymous_id = serializers.CharField(source='case.subject.anonymous_id', read_only=True)
    time = serializers.DateTimeField(source='created_at', format="%I:%M %p", read_only=True)
    date = serializers.DateTimeField(source='created_at', format="%b %d, %Y", read_only=True)

    # CamelCase aliases for frontend matching
    promptMessage = serializers.CharField(source='prompt_message')
    victimResponse = serializers.CharField(source='response_text')
    sentiment = serializers.CharField(source='sentiment_label')
    threatDetected = serializers.BooleanField(source='threat_detected')
    threatKeywords = serializers.JSONField(source='threat_keywords')
    voiceStressLevel = serializers.CharField(source='voice_stress_level')
    voiceStressScore = serializers.IntegerField(source='voice_stress_score')
    distressDelta = serializers.CharField(source='distress_delta')
    aiSignals = serializers.JSONField(source='ai_signals')
    processingStatus = serializers.CharField(source='processing_status')

    class Meta:
        model = Interaction
        fields = [
            'id',
            'case_id',
            'anonymous_id',
            'channel',
            'direction',
            'promptMessage',
            'victimResponse',
            'sentiment',
            'threatDetected',
            'threatKeywords',
            'voiceStressLevel',
            'voiceStressScore',
            'distressDelta',
            'aiSignals',
            'processingStatus',
            'language',
            'audio_duration_seconds',
            'time',
            'date',
            'created_at',
        ]


class CreateInteractionSerializer(serializers.Serializer):
    case_id = serializers.CharField(required=True)
    channel = serializers.CharField(required=False, default="Chatbot")
    prompt = serializers.CharField(required=False, allow_blank=True, default="")
    response_text = serializers.CharField(required=False, allow_blank=True, default="")
    language = serializers.CharField(required=False, default="en")
    audio = serializers.FileField(required=False, allow_null=True)


class CheckInSimulatorSerializer(serializers.Serializer):
    """
    Simulator schema matching the frontend modal for live demo interactions.
    """
    case_id = serializers.CharField(required=True)
    channel = serializers.CharField(default="Chatbot")
    response_text = serializers.CharField(required=True)
    language = serializers.CharField(default="en")
    simulated_voice_stress = serializers.IntegerField(default=45)
