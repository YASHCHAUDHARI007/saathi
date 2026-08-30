from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    time = serializers.DateTimeField(source='created_at', format="%I:%M %p", read_only=True)
    date = serializers.DateTimeField(source='created_at', format="%b %d, %Y", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'user_name',
            'user_role',
            'action',
            'resource_type',
            'resource_id',
            'ip_address',
            'details',
            'time',
            'date',
            'created_at',
        ]
