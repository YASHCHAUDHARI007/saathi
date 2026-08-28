from rest_framework import serializers
from .models import Intervention

class InterventionSerializer(serializers.ModelSerializer):
    caseId = serializers.CharField(source='case.id', read_only=True)
    victimAnonymousId = serializers.CharField(source='case.subject.anonymous_id', read_only=True)
    assignedTo = serializers.CharField(source='assigned_to_name')
    targetDate = serializers.CharField(source='target_date')
    completedDate = serializers.CharField(source='completed_date', allow_null=True)

    class Meta:
        model = Intervention
        fields = [
            'id',
            'caseId',
            'victimAnonymousId',
            'type',
            'title',
            'description',
            'status',
            'priority',
            'assignedTo',
            'department',
            'targetDate',
            'completedDate',
            'notes',
            'created_at',
        ]


class CreateInterventionSerializer(serializers.Serializer):
    case_id = serializers.CharField(required=True)
    type = serializers.CharField(default="Counselling")
    title = serializers.CharField(required=True)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    priority = serializers.CharField(default="P2")
    assigned_to_name = serializers.CharField(required=False, default="Dr. Sunita Deshmukh")
    department = serializers.CharField(default="District Legal Services Authority (DLSA)")
    target_date = serializers.CharField(required=False, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class UpdateInterventionStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['Pending', 'In Progress', 'Completed', 'Escalated'])
    notes = serializers.CharField(required=False, allow_blank=True, default="")
