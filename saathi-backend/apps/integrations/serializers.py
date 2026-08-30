from rest_framework import serializers
from .models import DepartmentIntegration, IntegrationEvent

class DepartmentIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentIntegration
        fields = ['id', 'name', 'code', 'api_endpoint', 'is_active', 'last_sync_at', 'sync_status']


class IntegrationEventSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)
    case_id = serializers.CharField(source='case.id', read_only=True)

    class Meta:
        model = IntegrationEvent
        fields = [
            'id',
            'department_name',
            'department_code',
            'case_id',
            'event_type',
            'external_reference',
            'summary',
            'payload',
            'received_at',
        ]


class IngestSimulatedEventSerializer(serializers.Serializer):
    case_id = serializers.CharField(required=True)
    event_code = serializers.ChoiceField(
        choices=[
            'BAIL_HEARING_SCHEDULED',
            'BAIL_GRANTED',
            'CHARGE_SHEET_FILED',
            'WITNESS_INTIMIDATION_REPORTED',
            'RELIEF_DISBURSED',
            'POLICE_PROTECTION_DEPLOYED',
        ],
        required=True
    )
    summary = serializers.CharField(required=False, allow_blank=True)
