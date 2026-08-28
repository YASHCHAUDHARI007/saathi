from rest_framework import serializers
from .models import PersonalBaseline, LongitudinalMetric, ContributingFactorItem, RiskAssessment

class PersonalBaselineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalBaseline
        fields = ['baseline_score', 'sample_count', 'established_date', 'updated_at']


class LongitudinalMetricSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    weekLabel = serializers.CharField(source='week_label')
    distressScore = serializers.IntegerField(source='distress_score')
    engagementScore = serializers.IntegerField(source='engagement_score')
    sentimentScore = serializers.IntegerField(source='sentiment_score')
    threatSignalScore = serializers.IntegerField(source='threat_signal_score')
    checkInFrequency = serializers.IntegerField(source='check_in_frequency')
    caseStage = serializers.CharField(source='case_stage')
    detectedSignal = serializers.CharField(source='detected_signal')

    class Meta:
        model = LongitudinalMetric
        fields = [
            'id',
            'date',
            'weekLabel',
            'distressScore',
            'engagementScore',
            'sentimentScore',
            'threatSignalScore',
            'checkInFrequency',
            'caseStage',
            'detectedSignal',
            'notes',
        ]

    def get_date(self, obj):
        return obj.recorded_date.strftime("%b %d")


class ContributingFactorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributingFactorItem
        fields = ['id', 'factor', 'points', 'category', 'description']


class RiskAssessmentSerializer(serializers.ModelSerializer):
    riskLevel = serializers.CharField(source='risk_level')
    previousLevel = serializers.CharField(source='previous_level')
    distressScore = serializers.IntegerField(source='distress_score')
    primaryFactor = serializers.CharField(source='primary_factor')
    aiSummary = serializers.CharField(source='ai_summary')

    class Meta:
        model = RiskAssessment
        fields = [
            'id',
            'riskLevel',
            'previousLevel',
            'distressScore',
            'primaryFactor',
            'aiSummary',
            'confidence',
            'created_at',
        ]
