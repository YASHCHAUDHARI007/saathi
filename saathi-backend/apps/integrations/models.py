import uuid
from django.db import models
from apps.cases.models import Case

class DepartmentCodeChoices(models.TextChoices):
    POLICE = 'POLICE', 'State Police (CCTNS / ICJS)'
    COURT = 'COURT', 'Special Court (eCourts / CIS)'
    SOCIAL_JUSTICE = 'SOCIAL_JUSTICE', 'Social Justice & Empowerment Department'
    HEALTH = 'HEALTH', 'District Health & Civil Hospital'
    LEGAL_AID = 'LEGAL_AID', 'District Legal Services Authority (DLSA)'
    WITNESS_PROTECTION = 'WITNESS_PROTECTION', 'District Witness Protection Committee'


class DepartmentIntegration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, choices=DepartmentCodeChoices.choices, unique=True)
    api_endpoint = models.URLField(blank=True, default="https://api.gov.in/icjs/mock")
    is_active = models.BooleanField(default=True)
    last_sync_at = models.DateTimeField(auto_now=True)
    sync_status = models.CharField(max_length=50, default="ONLINE")

    def __str__(self):
        return f"{self.name} ({self.code})"


class IntegrationEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(DepartmentIntegration, on_delete=models.CASCADE, related_name='events')
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='integration_events')
    event_type = models.CharField(max_length=100, db_index=True)
    external_reference = models.CharField(max_length=100, blank=True, default="")
    summary = models.CharField(max_length=255)
    payload = models.JSONField(default=dict, blank=True)
    received_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-received_at']

    def __str__(self):
        return f"[{self.department.code}] {self.event_type} - {self.case_id}"
