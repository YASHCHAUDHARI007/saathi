import uuid
from django.db import models
from apps.cases.models import Case
from apps.interactions.models import Interaction

class AIModelRun(models.Model):
    """
    Provenance tracking for specific model executions (XLM-RoBERTa, GoEmotions, IndicConformer, VSA).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_name = models.CharField(max_length=150, db_index=True)
    model_version = models.CharField(max_length=50, default="1.0.0")
    latency_ms = models.FloatField(default=0.0)
    input_payload = models.JSONField(default=dict, blank=True)
    output_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.model_name} (v{self.model_version}) - {self.created_at}"


class AIAnalysis(models.Model):
    """
    Composite bundle of all AI assessments for a given interaction.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interaction = models.OneToOneField(Interaction, on_delete=models.CASCADE, related_name='ai_analysis')
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='ai_analyses')
    confidence_score = models.FloatField(default=0.85)
    requires_human_review = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"AIAnalysis for {self.interaction_id} ({self.confidence_score:.2f})"


class DistressAssessment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.OneToOneField(AIAnalysis, on_delete=models.CASCADE, related_name='distress_assessment')
    distress_score = models.IntegerField(default=30)
    sentiment_score = models.IntegerField(default=0)
    sentiment_label = models.CharField(max_length=50, default="Neutral")
    threat_detected = models.BooleanField(default=False)
    threat_keywords = models.JSONField(default=list, blank=True)


class EmotionAssessment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.OneToOneField(AIAnalysis, on_delete=models.CASCADE, related_name='emotion_assessment')
    primary_emotion = models.CharField(max_length=50, default="Neutral")
    intensity = models.FloatField(default=0.8)
    emotion_breakdown = models.JSONField(default=dict, blank=True)


class VoiceStressAssessment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.OneToOneField(AIAnalysis, on_delete=models.CASCADE, related_name='voice_stress_assessment')
    voice_stress_score = models.IntegerField(default=30)
    voice_stress_level = models.CharField(max_length=50, default="Normal")
    acoustic_features = models.JSONField(default=dict, blank=True)


class AIAuditResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.OneToOneField(AIAnalysis, on_delete=models.CASCADE, related_name='audit_result')
    overall_confidence = models.FloatField(default=0.85)
    disagreement_score = models.FloatField(default=0.0)
    has_cross_modal_conflict = models.BooleanField(default=False)
    requires_human_review = models.BooleanField(default=False)
    audit_flags = models.JSONField(default=list, blank=True)
    reasoning = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Audit for {self.analysis_id} (Conflict: {self.has_cross_modal_conflict})"
