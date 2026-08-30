from rest_framework import serializers
from .models import Case, Subject, CaseMilestone, CaseEvent
from apps.accounts.models import District, State, User

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'anonymous_id', 'role', 'masked_contact', 'created_at']


class CaseMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseMilestone
        fields = [
            'id',
            'stage',
            'title',
            'date',
            'completed',
            'is_current',
            'distress_trend',
            'interventions',
            'important_events',
            'order'
        ]


class CaseEventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    time = serializers.DateTimeField(source='created_at', format="%I:%M %p", read_only=True)
    date = serializers.DateTimeField(source='created_at', format="%b %d, %Y", read_only=True)

    class Meta:
        model = CaseEvent
        fields = [
            'id',
            'event_type',
            'title',
            'description',
            'severity',
            'metadata',
            'created_by',
            'created_by_name',
            'created_at',
            'time',
            'date',
        ]


class CaseListSerializer(serializers.ModelSerializer):
    victimAnonymousId = serializers.CharField(source='subject.anonymous_id', read_only=True)
    subjectRole = serializers.CharField(source='subject.role', read_only=True)
    caseType = serializers.CharField(source='case_type')
    currentStage = serializers.CharField(source='current_stage')
    district = serializers.CharField(source='district.name', read_only=True)
    state = serializers.CharField(source='state.name', read_only=True)
    distressScore = serializers.IntegerField(source='distress_score')
    previousDistressScore = serializers.IntegerField(source='previous_distress_score')
    baselineScore = serializers.IntegerField(source='baseline_score')
    riskLevel = serializers.CharField(source='risk_level')
    trend = serializers.CharField(source='trend_delta')
    trendDirection = serializers.CharField(source='trend_direction')
    monitoringStatus = serializers.CharField(source='monitoring_status')
    assignedCounsellor = serializers.SerializerMethodField()
    counsellorPhone = serializers.CharField(source='counsellor_phone')
    lastInteractionTime = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id',
            'victimAnonymousId',
            'subjectRole',
            'caseType',
            'district',
            'state',
            'currentStage',
            'distressScore',
            'previousDistressScore',
            'baselineScore',
            'riskLevel',
            'trend',
            'trendDirection',
            'lastInteractionTime',
            'assignedCounsellor',
            'counsellorPhone',
            'priority',
            'monitoringStatus',
            'textSentiment',
            'distressLanguageStatus',
            'voiceStressStatus',
            'emotionSignal',
            'engagementRateChange',
            'missedFollowUps',
            'responseFrequency',
            'primaryContributingFactor',
            'aiExplanationSummary',
            'updated_at',
        ]

    def get_assignedCounsellor(self, obj):
        if obj.assigned_counsellor:
            return obj.assigned_counsellor.get_full_name() or obj.assigned_counsellor.username
        return "Unassigned"

    def get_lastInteractionTime(self, obj):
        latest_interaction = obj.interactions.order_by('-created_at').first()
        if latest_interaction:
            return latest_interaction.created_at.strftime("%b %d, %I:%M %p")
        return "2h ago"

    # CamelCase aliases for frontend compatibility
    textSentiment = serializers.CharField(source='text_sentiment')
    distressLanguageStatus = serializers.CharField(source='distress_language_status')
    voiceStressStatus = serializers.CharField(source='voice_stress_status')
    emotionSignal = serializers.CharField(source='emotion_signal')
    engagementRateChange = serializers.CharField(source='engagement_rate_change')
    missedFollowUps = serializers.IntegerField(source='missed_follow_ups')
    responseFrequency = serializers.CharField(source='response_frequency')
    primaryContributingFactor = serializers.CharField(source='primary_contributing_factor')
    aiExplanationSummary = serializers.CharField(source='ai_explanation_summary')


class CaseDetailSerializer(CaseListSerializer):
    milestones = CaseMilestoneSerializer(many=True, read_only=True)
    alertTimeline = serializers.SerializerMethodField()
    contributingFactors = serializers.SerializerMethodField()
    longitudinalTrajectory = serializers.SerializerMethodField()
    interactions = serializers.SerializerMethodField()
    interventions = serializers.SerializerMethodField()

    class Meta(CaseListSerializer.Meta):
        fields = CaseListSerializer.Meta.fields + [
            'milestones',
            'alertTimeline',
            'contributingFactors',
            'longitudinalTrajectory',
            'interactions',
            'interventions',
        ]

    def get_alertTimeline(self, obj):
        events = obj.timeline_events.all()[:15]
        return CaseEventSerializer(events, many=True).data

    def get_contributingFactors(self, obj):
        from apps.risk.serializers import ContributingFactorSerializer
        factors = obj.contributing_factors.all()
        return ContributingFactorSerializer(factors, many=True).data

    def get_longitudinalTrajectory(self, obj):
        from apps.risk.serializers import LongitudinalMetricSerializer
        metrics = obj.longitudinal_metrics.all().order_by('recorded_date')
        return LongitudinalMetricSerializer(metrics, many=True).data

    def get_interactions(self, obj):
        from apps.interactions.serializers import InteractionSerializer
        interactions = obj.interactions.all().order_by('-created_at')[:20]
        return InteractionSerializer(interactions, many=True).data

    def get_interventions(self, obj):
        from apps.interventions.serializers import InterventionSerializer
        interventions = obj.interventions.all().order_by('-created_at')
        return InterventionSerializer(interventions, many=True).data


class AssignCounsellorSerializer(serializers.Serializer):
    counsellor_id = serializers.UUIDField(required=False)
    counsellor_name = serializers.CharField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True)


class TriggerSOSSerializer(serializers.Serializer):
    threat_details = serializers.CharField(required=False, default="")
    reason = serializers.CharField(required=False, default="")
    location = serializers.CharField(required=False, default="Mobile GPS Coordinates")

    def validate(self, attrs):
        if not attrs.get('threat_details') and not attrs.get('reason'):
            attrs['threat_details'] = "Emergency distress SOS triggered by citizen / victim."
        elif not attrs.get('threat_details'):
            attrs['threat_details'] = attrs.get('reason')
        return attrs
