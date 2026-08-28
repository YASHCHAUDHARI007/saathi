from typing import Optional
from django.utils import timezone
from django.db import transaction
from .models import Alert, AlertTimelineEvent, AlertStatusChoices
from apps.cases.models import CaseEvent
from apps.accounts.models import User

class AlertService:
    @staticmethod
    @transaction.atomic
    def acknowledge_alert(alert: Alert, user: User) -> Alert:
        alert.status = AlertStatusChoices.ACKNOWLEDGED
        alert.acknowledged_by = user
        alert.acknowledged_at = timezone.now()
        alert.save(update_fields=['status', 'acknowledged_by', 'acknowledged_at'])

        AlertTimelineEvent.objects.create(
            alert=alert,
            event_type='ALERT_ACKNOWLEDGED',
            title=f'Alert Acknowledged by {user.get_full_name() or user.username}',
            description=f'Official acknowledgement logged under designation {user.designation or user.get_role_display()}.',
            created_by=user
        )

        CaseEvent.objects.create(
            case=alert.case,
            event_type='ALERT_ACKNOWLEDGED',
            title=f'Alert {alert.id} Acknowledged',
            description=f'Officer {user.get_full_name() or user.username} commenced review.',
            severity='info',
            created_by=user
        )
        return alert

    @staticmethod
    @transaction.atomic
    def resolve_alert(alert: Alert, user: User, notes: str = "") -> Alert:
        alert.status = AlertStatusChoices.RESOLVED
        alert.resolution_notes = notes
        alert.resolved_at = timezone.now()
        alert.save(update_fields=['status', 'resolution_notes', 'resolved_at'])

        AlertTimelineEvent.objects.create(
            alert=alert,
            event_type='ALERT_RESOLVED',
            title=f'Alert Resolved by {user.get_full_name() or user.username}',
            description=notes or "Risk mitigated; protective actions verified.",
            created_by=user
        )

        CaseEvent.objects.create(
            case=alert.case,
            event_type='ALERT_RESOLVED',
            title=f'Alert {alert.id} Resolved',
            description=notes or "Risk mitigated.",
            severity='success',
            created_by=user
        )
        return alert
