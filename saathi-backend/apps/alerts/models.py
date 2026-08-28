import uuid
from django.db import models
from django.conf import settings
from apps.cases.models import Case, RiskLevelChoices

class AlertStatusChoices(models.TextChoices):
    UNREAD = 'Unread', 'Unread'
    ACKNOWLEDGED = 'Acknowledged', 'Acknowledged'
    ACTION_TAKEN = 'Action Taken', 'Action Taken'
    RESOLVED = 'Resolved', 'Resolved'


class Alert(models.Model):
    """
    Actionable alert dispatched to District Officers and Counsellors upon acute risk elevation.
    """
    id = models.CharField(max_length=100, primary_key=True)  # e.g. ALT-2026-88194
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='alerts')
    risk_level = models.CharField(
        max_length=20,
        choices=RiskLevelChoices.choices,
        default=RiskLevelChoices.HIGH,
        db_index=True
    )
    status = models.CharField(
        max_length=30,
        choices=AlertStatusChoices.choices,
        default=AlertStatusChoices.UNREAD,
        db_index=True
    )
    distress_score = models.IntegerField(default=75)
    previous_distress_score = models.IntegerField(default=55)
    delta_label = models.CharField(max_length=30, default="+20 pts")
    primary_factor = models.TextField(blank=True, default="")
    contributing_factors = models.JSONField(default=list, blank=True)
    recommended_actions = models.JSONField(default=list, blank=True)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_alerts'
    )
    acknowledged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_alerts'
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True, default="")
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} [{self.risk_level}] - {self.case_id} ({self.status})"


class AlertTimelineEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name='timeline')
    event_type = models.CharField(max_length=100)
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.alert_id}: {self.title}"
