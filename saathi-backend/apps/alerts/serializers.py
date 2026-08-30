from rest_framework import serializers
from .models import Alert, AlertTimelineEvent
from apps.cases.models import Case

class AlertTimelineEventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    time = serializers.DateTimeField(source='created_at', format="%I:%M %p", read_only=True)
    date = serializers.DateTimeField(source='created_at', format="%b %d, %Y", read_only=True)

    class Meta:
        model = AlertTimelineEvent
        fields = ['id', 'event_type', 'title', 'description', 'created_by_name', 'time', 'date']


class AlertSerializer(serializers.ModelSerializer):
    caseId = serializers.CharField(source='case.id', read_only=True)
    victimAnonymousId = serializers.CharField(source='case.subject.anonymous_id', read_only=True)
    district = serializers.CharField(source='case.district.name', read_only=True)
    state = serializers.CharField(source='case.state.name', read_only=True)
    caseType = serializers.CharField(source='case.case_type', read_only=True)
    currentStage = serializers.CharField(source='case.current_stage', read_only=True)
    
    riskLevel = serializers.CharField(source='risk_level')
    distressScore = serializers.IntegerField(source='distress_score')
    previousDistressScore = serializers.IntegerField(source='previous_distress_score')
    delta = serializers.CharField(source='delta_label')
    primaryFactor = serializers.CharField(source='primary_factor')
    contributingFactors = serializers.JSONField(source='contributing_factors')
    recommendedActions = serializers.JSONField(source='recommended_actions')
    assignedTo = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created_at', format="%b %d, %I:%M %p", read_only=True)
    timeAgo = serializers.SerializerMethodField()
    timeline = AlertTimelineEventSerializer(many=True, read_only=True)

    class Meta:
        model = Alert
        fields = [
            'id',
            'caseId',
            'victimAnonymousId',
            'district',
            'state',
            'caseType',
            'currentStage',
            'riskLevel',
            'status',
            'distressScore',
            'previousDistressScore',
            'delta',
            'primaryFactor',
            'contributingFactors',
            'recommendedActions',
            'assignedTo',
            'timestamp',
            'timeAgo',
            'resolution_notes',
            'timeline',
        ]

    def get_assignedTo(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return "Unassigned"

    def get_timeAgo(self, obj):
        return "Just now"


class AlertActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['acknowledge', 'resolve'])
    notes = serializers.CharField(required=False, allow_blank=True, default="")
