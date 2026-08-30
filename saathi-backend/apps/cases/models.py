import uuid
from django.db import models
from django.conf import settings
from apps.accounts.models import District, State

class RiskLevelChoices(models.TextChoices):
    LOW = 'LOW', 'LOW'
    MODERATE = 'MODERATE', 'MODERATE'
    HIGH = 'HIGH', 'HIGH'
    CRITICAL = 'CRITICAL', 'CRITICAL'


class CaseStageChoices(models.TextChoices):
    COMPLAINT = 'Complaint', 'Complaint'
    INVESTIGATION = 'Investigation', 'Investigation'
    TRIAL = 'Trial', 'Trial'
    JUDGMENT = 'Judgment', 'Judgment'
    COMPENSATION = 'Compensation', 'Compensation'
    REHABILITATION = 'Rehabilitation', 'Rehabilitation'
    CLOSURE = 'Closure', 'Closure'


class CaseTypeChoices(models.TextChoices):
    CASTE_VIOLENCE = 'Caste-based Violence', 'Caste-based Violence'
    SC_ST_ATROCITY = 'Atrocities against SC/ST', 'Atrocities against SC/ST'
    WITNESS_INTIMIDATION = 'Witness Intimidation', 'Witness Intimidation'
    SEXUAL_ASSAULT = 'Sexual Assault / Rape', 'Sexual Assault / Rape'
    PHYSICAL_ASSAULT = 'Physical Assault', 'Physical Assault'
    SOCIAL_BOYCOTT = 'Social Boycott', 'Social Boycott'
    LAND_DISPOSSESSION = 'Land Dispossession', 'Land Dispossession'
    HATE_CRIME = 'Hate Crime / Verbal Abuse', 'Hate Crime / Verbal Abuse'


class SubjectRoleChoices(models.TextChoices):
    VICTIM = 'Victim', 'Victim'
    WITNESS = 'Witness', 'Witness'
    FAMILY_MEMBER = 'Family Member', 'Family Member'


class PriorityChoices(models.TextChoices):
    P1 = 'P1', 'P1'
    P2 = 'P2', 'P2'
    P3 = 'P3', 'P3'


class MonitoringStatusChoices(models.TextChoices):
    ACTIVE = 'Active', 'Active'
    ELEVATED = 'Elevated', 'Elevated'
    UNDER_REVIEW = 'Under Review', 'Under Review'
    DORMANT = 'Dormant', 'Dormant'


class TrendDirectionChoices(models.TextChoices):
    INCREASING = 'increasing', 'increasing'
    STABLE = 'stable', 'stable'
    DECREASING = 'decreasing', 'decreasing'


class Subject(models.Model):
    """
    Anonymous Subject representation preserving victim privacy & confidentiality.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    anonymous_id = models.CharField(max_length=100, unique=True, db_index=True)
    role = models.CharField(
        max_length=30,
        choices=SubjectRoleChoices.choices,
        default=SubjectRoleChoices.VICTIM
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subject_profile'
    )
    masked_contact = models.CharField(max_length=50, blank=True, default="•••• •••• 4819")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.anonymous_id} ({self.role})"


class Case(models.Model):
    """
    Core Case model representing legal tracking and real-time vulnerability state.
    """
    id = models.CharField(max_length=100, primary_key=True)  # e.g. ATC-2026-10482
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='cases')
    case_type = models.CharField(
        max_length=60,
        choices=CaseTypeChoices.choices,
        default=CaseTypeChoices.SC_ST_ATROCITY,
        db_index=True
    )
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='cases')
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='cases')
    current_stage = models.CharField(
        max_length=30,
        choices=CaseStageChoices.choices,
        default=CaseStageChoices.INVESTIGATION,
        db_index=True
    )
    
    # Real-time distress & vulnerability indices
    distress_score = models.IntegerField(default=35, help_text="Current composite score (0-100)")
    previous_distress_score = models.IntegerField(default=35, help_text="Distress score 7 days prior")
    baseline_score = models.IntegerField(default=35, help_text="Personal historical baseline")
    risk_level = models.CharField(
        max_length=20,
        choices=RiskLevelChoices.choices,
        default=RiskLevelChoices.LOW,
        db_index=True
    )
    trend_direction = models.CharField(
        max_length=20,
        choices=TrendDirectionChoices.choices,
        default=TrendDirectionChoices.STABLE
    )
    trend_delta = models.CharField(max_length=50, default="→ 0 (7d)")
    
    monitoring_status = models.CharField(
        max_length=30,
        choices=MonitoringStatusChoices.choices,
        default=MonitoringStatusChoices.ACTIVE
    )
    priority = models.CharField(
        max_length=10,
        choices=PriorityChoices.choices,
        default=PriorityChoices.P2
    )
    
    # Assigned Human Resources
    assigned_counsellor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_cases'
    )
    counsellor_phone = models.CharField(max_length=30, blank=True, default="+91 98230 44102")
    
    # Legal Context & Registry
    fir_number = models.CharField(max_length=100, blank=True, default="")
    police_station = models.CharField(max_length=100, blank=True, default="")
    special_court = models.CharField(max_length=150, blank=True, default="")
    
    # Multimodal signal states
    text_sentiment = models.CharField(max_length=40, default="Neutral")
    distress_language_status = models.CharField(max_length=40, default="Normal")
    voice_stress_status = models.CharField(max_length=40, default="Normal")
    emotion_signal = models.CharField(max_length=40, default="Calm")
    engagement_rate_change = models.CharField(max_length=30, default="0%")
    missed_follow_ups = models.IntegerField(default=0)
    response_frequency = models.CharField(max_length=40, default="Active")
    
    # Explainability & Summary
    primary_contributing_factor = models.TextField(blank=True, default="")
    ai_explanation_summary = models.TextField(blank=True, default="")
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.id} - {self.subject.anonymous_id} ({self.district.name})"


class CaseMilestone(models.Model):
    """
    Judicial & administrative milestone tracker for the case.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='milestones')
    stage = models.CharField(max_length=30, choices=CaseStageChoices.choices)
    title = models.CharField(max_length=200)
    date = models.CharField(max_length=50)
    completed = models.BooleanField(default=False)
    is_current = models.BooleanField(default=False)
    distress_trend = models.CharField(max_length=100, blank=True, default="")
    interventions = models.JSONField(default=list, blank=True)
    important_events = models.JSONField(default=list, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'date']

    def __str__(self):
        return f"{self.case_id} - {self.title} ({'✓' if self.completed else '⏳'})"


class CaseEvent(models.Model):
    """
    Audit-grade immutable timeline event for case progression and alerts.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='timeline_events')
    event_type = models.CharField(max_length=100, db_index=True)
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True, default="")
    severity = models.CharField(
        max_length=20,
        choices=[
            ('info', 'Info'),
            ('warning', 'Warning'),
            ('critical', 'Critical'),
            ('success', 'Success')
        ],
        default='info'
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity.upper()}] {self.case_id} - {self.title} ({self.created_at})"
