from rest_framework import serializers
from .models import (
    AIAnalysis,
    DistressAssessment,
    EmotionAssessment,
    VoiceStressAssessment,
    AIAuditResult,
    AIModelRun,
)

class DistressAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistressAssessment
        fields = ['distress_score', 'sentiment_score', 'sentiment_label', 'threat_detected', 'threat_keywords']


class EmotionAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionAssessment
        fields = ['primary_emotion', 'intensity', 'emotion_breakdown']


class VoiceStressAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceStressAssessment
        fields = ['voice_stress_score', 'voice_stress_level', 'acoustic_features']


class AIAuditResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAuditResult
        fields = [
            'overall_confidence',
            'disagreement_score',
            'has_cross_modal_conflict',
            'requires_human_review',
            'audit_flags',
            'reasoning'
        ]


class AIAnalysisSerializer(serializers.ModelSerializer):
    distress = DistressAssessmentSerializer(source='distress_assessment', read_only=True)
    emotion = EmotionAssessmentSerializer(source='emotion_assessment', read_only=True)
    voice = VoiceStressAssessmentSerializer(source='voice_stress_assessment', read_only=True)
    audit = AIAuditResultSerializer(source='audit_result', read_only=True)

    class Meta:
        model = AIAnalysis
        fields = [
            'id',
            'interaction',
            'case',
            'confidence_score',
            'requires_human_review',
            'distress',
            'emotion',
            'voice',
            'audit',
            'created_at',
        ]
