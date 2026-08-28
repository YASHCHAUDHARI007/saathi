import uuid
from django.db import models
from apps.cases.models import Case, RiskLevelChoices
from apps.interactions.models import Interaction

class PersonalBaseline(models.Model):
    """
    Personalized historical baseline to prevent population-wide bias.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.OneToOneField(Case, on_delete=models.CASCADE, related_name='personal_baseline')
    baseline_score = models.FloatField(default=35.0)
    sample_count = models.IntegerField(default=1)
    established_date = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Baseline for {self.case_id}: {self.baseline_score:.1f}"


class LongitudinalMetric(models.Model):
    """
    Temporal point along the victim's multi-week monitoring journey.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='longitudinal_metrics')
    interaction = models.ForeignKey(Interaction, on_delete=models.SET_NULL, null=True, blank=True)
    recorded_date = models.DateField()
    week_label = models.CharField(max_length=50, default="Week 1")
    distress_score = models.IntegerField(default=35)
    engagement_score = models.IntegerField(default=85)
    sentiment_score = models.IntegerField(default=0)
    threat_signal_score = models.IntegerField(default=10)
    check_in_frequency = models.IntegerField(default=4)
    case_stage = models.CharField(max_length=50, default="Investigation")
    detected_signal = models.CharField(max_length=255, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['recorded_date', 'created_at']

    def __str__(self):
        return f"{self.case_id} - {self.week_label} (Distress: {self.distress_score})"


class ContributingFactorItem(models.Model):
    """
    Decomposed explainability factor with point contribution.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='contributing_factors')
    factor = models.CharField(max_length=200)
    points = models.IntegerField(default=10)
    category = models.CharField(max_length=50, default="Trend")
    description = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['-points']

    def __str__(self):
        return f"+{self.points} pts: {self.factor} ({self.case_id})"


class RiskAssessment(models.Model):
    """
    Historical record of risk tier classifications.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='risk_assessments')
    risk_level = models.CharField(max_length=20, choices=RiskLevelChoices.choices)
    previous_level = models.CharField(max_length=20, choices=RiskLevelChoices.choices)
    distress_score = models.IntegerField()
    primary_factor = models.TextField()
    ai_summary = models.TextField()
    confidence = models.FloatField(default=0.85)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.case_id}: {self.risk_level} at {self.created_at}"
