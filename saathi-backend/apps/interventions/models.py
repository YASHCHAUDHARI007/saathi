import uuid
from django.db import models
from django.conf import settings
from apps.cases.models import Case, PriorityChoices

class InterventionTypeChoices(models.TextChoices):
    COUNSELLING = 'Counselling', 'Counselling'
    MEDICAL_TREATMENT = 'Medical Treatment', 'Medical Treatment'
    WITNESS_PROTECTION = 'Witness Protection', 'Witness Protection'
    RELOCATION_SUPPORT = 'Relocation Support', 'Relocation Support'
    FINANCIAL_ASSISTANCE = 'Financial Assistance', 'Financial Assistance'
    LEGAL_AID = 'Legal Aid', 'Legal Aid'
    REHABILITATION = 'Rehabilitation', 'Rehabilitation'


class InterventionStatusChoices(models.TextChoices):
    PENDING = 'Pending', 'Pending'
    IN_PROGRESS = 'In Progress', 'In Progress'
    COMPLETED = 'Completed', 'Completed'
    ESCALATED = 'Escalated', 'Escalated'


class Intervention(models.Model):
    id = models.CharField(max_length=100, primary_key=True)  # e.g. INTV-2026-4412
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='interventions')
    type = models.CharField(
        max_length=50,
        choices=InterventionTypeChoices.choices,
        default=InterventionTypeChoices.COUNSELLING,
        db_index=True
    )
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=30,
        choices=InterventionStatusChoices.choices,
        default=InterventionStatusChoices.PENDING,
        db_index=True
    )
    priority = models.CharField(
        max_length=10,
        choices=PriorityChoices.choices,
        default=PriorityChoices.P2
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_interventions'
    )
    assigned_to_name = models.CharField(max_length=150, blank=True, default="Dr. Sunita Deshmukh")
    department = models.CharField(max_length=150, default="District Legal Services Authority (DLSA)")
    target_date = models.CharField(max_length=50, blank=True, default="2026-09-05")
    completed_date = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} [{self.type}] - {self.case_id} ({self.status})"
