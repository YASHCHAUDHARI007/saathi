import uuid
from django.db import models
from apps.cases.models import Case

class InteractionChannelChoices(models.TextChoices):
    CHATBOT = 'Chatbot', 'Chatbot'
    IVRS = 'IVRS', 'IVRS Callback'
    SMS = 'SMS', 'SMS Pulse'
    MOBILE_APP = 'Mobile App', 'Mobile App'
    WEB_PORTAL = 'Web Portal', 'Web Portal'
    HELPLINE = 'Toll-Free Helpline', 'Toll-Free Helpline'


class ProcessingStatusChoices(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PROCESSING = 'PROCESSING', 'Processing'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'


class Interaction(models.Model):
    """
    Multimodal check-in / conversation event between citizen and SAATHI platform.
    """
    id = models.CharField(max_length=100, primary_key=True)  # e.g. INT-99104
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='interactions')
    channel = models.CharField(
        max_length=40,
        choices=InteractionChannelChoices.choices,
        default=InteractionChannelChoices.CHATBOT,
        db_index=True
    )
    direction = models.CharField(
        max_length=20,
        choices=[('INBOUND', 'Inbound'), ('OUTBOUND', 'Outbound')],
        default='INBOUND'
    )
    prompt_message = models.TextField(blank=True, default="")
    response_text = models.TextField(blank=True, default="")
    audio_file = models.FileField(upload_to='interactions/audio/%Y/%m/', null=True, blank=True)
    audio_duration_seconds = models.FloatField(default=0.0)
    language = models.CharField(max_length=20, default="en")

    # Processing & AI Outputs
    processing_status = models.CharField(
        max_length=20,
        choices=ProcessingStatusChoices.choices,
        default=ProcessingStatusChoices.PENDING,
        db_index=True
    )
    sentiment_label = models.CharField(max_length=40, default="Neutral")
    threat_detected = models.BooleanField(default=False)
    threat_keywords = models.JSONField(default=list, blank=True)
    voice_stress_score = models.IntegerField(default=30)
    voice_stress_level = models.CharField(max_length=30, default="Normal")
    distress_delta = models.CharField(max_length=30, default="+0")
    ai_signals = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} [{self.channel}] - {self.case_id} ({self.created_at})"
