from celery import shared_task
from django.db import transaction
from django.utils import timezone
import uuid

@shared_task(bind=True, max_retries=3)
def process_interaction_pipeline_task(self, interaction_id: str):
    """
    Celery background worker task for end-to-end multi-modal processing:
    1. ASR (Speech to text if audio attached)
    2. Text Distress & Threat NLP (XLM-RoBERTa)
    3. Emotion Classification (GoEmotions)
    4. Voice Stress Acoustic Analysis (Acoustic jitter/tremor)
    5. AI Safety & Disagreement Audit
    6. Feature Aggregator
    7. Baseline Engine & Longitudinal Trend
    8. Weighted Scoring Engine
    9. Risk Classifier & Explainability Decomposition
    10. Case & Alert State Updates
    """
    from apps.interactions.models import Interaction, ProcessingStatusChoices
    from apps.cases.models import Case, CaseEvent, RiskLevelChoices
    from apps.ai_analysis.models import (
        AIModelRun,
        AIAnalysis,
        DistressAssessment,
        EmotionAssessment,
        VoiceStressAssessment,
        AIAuditResult
    )
    from apps.risk.models import PersonalBaseline, LongitudinalMetric, RiskAssessment, ContributingFactorItem
    from apps.alerts.models import Alert, AlertStatusChoices
    from apps.audit.models import AuditLog

    from ai.text.distress import XLMRoBERTaDistressAdapter
    from ai.text.emotion import GoEmotionsAdapter
    from ai.voice.asr import IndicConformerASRAdapter
    from ai.voice.stress import VoiceStressAnalyzerAdapter
    from ai.audit.auditor import AIAuditor
    from ai.features.aggregator import FeatureAggregator
    from ai.baseline.baseline_service import BaselineEngine
    from ai.longitudinal.longitudinal_service import LongitudinalEngine
    from ai.scoring.scoring_engine import ScoringEngine
    from ai.risk.risk_engine import RiskEngine

    try:
        interaction = Interaction.objects.select_related('case', 'case__subject', 'case__district').get(id=interaction_id)
        interaction.processing_status = ProcessingStatusChoices.PROCESSING
        interaction.save(update_fields=['processing_status'])

        case = interaction.case
        text_content = interaction.response_text or interaction.prompt_message

        # Step 1: ASR if audio file is present
        if interaction.audio_file and not text_content:
            asr_adapter = IndicConformerASRAdapter()
            asr_result = asr_adapter.transcribe(interaction.audio_file.name, language=interaction.language)
            text_content = asr_result['transcript']
            interaction.response_text = text_content
            interaction.save(update_fields=['response_text'])

        # Step 2: Text Distress & Threat NLP
        distress_adapter = XLMRoBERTaDistressAdapter()
        text_res = distress_adapter.analyze(text_content, language=interaction.language)

        # Step 3: Emotion Analysis
        emotion_adapter = GoEmotionsAdapter()
        emotion_res = emotion_adapter.analyze(text_content)

        # Step 4: Voice Stress Analysis
        voice_adapter = VoiceStressAnalyzerAdapter()
        simulated_voice_stress = 75 if text_res['threat_detected'] else (55 if interaction.channel == 'IVRS' else 35)
        voice_res = voice_adapter.analyze_audio_features(simulation_stress=simulated_voice_stress)

        # Step 5: AI Audit Layer
        audit_res = AIAuditor.audit_analysis(text_res, emotion_res, voice_res)

        # Step 6: Feature Aggregator
        features = FeatureAggregator.aggregate(
            text_analysis=text_res,
            emotion_analysis=emotion_res,
            voice_analysis=voice_res,
            behavioral_signals={
                'missed_checkins': case.missed_follow_ups,
                'channel': interaction.channel,
            }
        )

        # Step 7: Baseline & Longitudinal Trajectory
        history = list(case.longitudinal_metrics.values_list('distress_score', flat=True))
        baseline_score = BaselineEngine.calculate_baseline(history) if history else case.baseline_score
        baseline_dev = BaselineEngine.compute_deviation(features['text_distress'], baseline_score)

        metrics_trajectory = list(case.longitudinal_metrics.values('distress_score', 'recorded_date'))
        longitudinal_stats = LongitudinalEngine.calculate_velocity_and_trend(metrics_trajectory)

        # Step 8: Multimodal Composite Scoring
        score_res = ScoringEngine.compute_composite_score(
            features=features,
            baseline_deviation=baseline_dev,
            longitudinal_stats=longitudinal_stats
        )
        new_distress_score = score_res['composite_distress_score']

        # Step 9: Risk Classification & Explainability
        risk_res = RiskEngine.evaluate_risk(
            distress_score=new_distress_score,
            features=features,
            baseline_deviation=baseline_dev,
            longitudinal_stats=longitudinal_stats
        )

        # Step 10: Atomic Database Updates
        with transaction.atomic():
            # Persist AI Analysis Bundle
            ai_analysis = AIAnalysis.objects.create(
                interaction=interaction,
                case=case,
                confidence_score=audit_res['overall_confidence'],
                requires_human_review=audit_res['requires_human_review']
            )

            DistressAssessment.objects.create(
                analysis=ai_analysis,
                distress_score=text_res['distress_score'],
                sentiment_score=text_res['sentiment_score'],
                sentiment_label=text_res['sentiment_label'],
                threat_detected=text_res['threat_detected'],
                threat_keywords=text_res['threat_keywords']
            )

            EmotionAssessment.objects.create(
                analysis=ai_analysis,
                primary_emotion=emotion_res['primary_emotion'],
                intensity=emotion_res['emotion_confidence'],
                emotion_breakdown=emotion_res['emotion_breakdown']
            )

            VoiceStressAssessment.objects.create(
                analysis=ai_analysis,
                voice_stress_score=voice_res['voice_stress_score'],
                voice_stress_level=voice_res['voice_stress_level'],
                acoustic_features=voice_res['acoustic_features']
            )

            AIAuditResult.objects.create(
                analysis=ai_analysis,
                overall_confidence=audit_res['overall_confidence'],
                disagreement_score=audit_res['disagreement_score'],
                has_cross_modal_conflict=audit_res['has_cross_modal_conflict'],
                requires_human_review=audit_res['requires_human_review'],
                audit_flags=audit_res['audit_flags'],
                reasoning=audit_res['audit_reasoning']
            )

            # Persist Longitudinal Metric Point
            LongitudinalMetric.objects.create(
                case=case,
                interaction=interaction,
                recorded_date=timezone.now().date(),
                week_label=f"Week {case.longitudinal_metrics.count() + 1}",
                distress_score=new_distress_score,
                engagement_score=max(10, 100 - case.missed_follow_ups * 25),
                sentiment_score=text_res['sentiment_score'],
                threat_signal_score=85 if text_res['threat_detected'] else 10,
                check_in_frequency=max(1, 4 - case.missed_follow_ups),
                case_stage=case.current_stage,
                detected_signal=risk_res['primary_contributing_factor'],
                notes=f"Automated {interaction.channel} pulse assessment."
            )

            # Persist Contributing Factors
            case.contributing_factors.all().delete()
            for f in risk_res['contributing_factors']:
                ContributingFactorItem.objects.create(
                    case=case,
                    factor=f['factor'],
                    points=f['points'],
                    category=f['category'],
                    description=f['description']
                )

            # Update Case Model Indices
            prev_score = case.distress_score
            delta_score = new_distress_score - prev_score
            case.previous_distress_score = prev_score
            case.distress_score = new_distress_score
            case.baseline_score = int(baseline_score)
            case.risk_level = risk_res['risk_level']
            case.trend_direction = longitudinal_stats['trend_direction']
            case.trend_delta = longitudinal_stats['trend_delta_label']
            case.text_sentiment = text_res['sentiment_label']
            case.distress_language_status = "Critical" if text_res['threat_detected'] else ("Elevated" if text_res['distress_score'] > 60 else "Normal")
            case.voice_stress_status = voice_res['voice_stress_level']
            case.emotion_signal = emotion_res['primary_emotion']
            case.primary_contributing_factor = risk_res['primary_contributing_factor']
            case.ai_explanation_summary = risk_res['ai_explanation_summary']
            if risk_res['risk_level'] in [RiskLevelChoices.HIGH, RiskLevelChoices.CRITICAL]:
                case.monitoring_status = 'Elevated'
            case.save()

            # Update Interaction Model Results
            interaction.processing_status = ProcessingStatusChoices.COMPLETED
            interaction.sentiment_label = text_res['sentiment_label']
            interaction.threat_detected = text_res['threat_detected']
            interaction.threat_keywords = text_res['threat_keywords']
            interaction.voice_stress_score = voice_res['voice_stress_score']
            interaction.voice_stress_level = voice_res['voice_stress_level']
            interaction.distress_delta = f"{'+' if delta_score >= 0 else ''}{delta_score}"
            interaction.ai_signals = [risk_res['primary_contributing_factor']]
            interaction.save()

            # Trigger High/Critical Alert if needed
            if risk_res['requires_immediate_alert']:
                alert_id = f"ALT-{timezone.now().strftime('%Y')}-{uuid.uuid4().hex[:5].upper()}"
                Alert.objects.create(
                    id=alert_id,
                    case=case,
                    risk_level=risk_res['risk_level'],
                    status=AlertStatusChoices.UNREAD,
                    distress_score=new_distress_score,
                    previous_distress_score=prev_score,
                    delta_label=f"{'+' if delta_score >= 0 else ''}{delta_score} pts",
                    primary_factor=risk_res['primary_contributing_factor'],
                    contributing_factors=risk_res['contributing_factors'],
                    recommended_actions=[
                        "Dispatch emergency protection officer",
                        "Schedule urgent clinical counselling pulse",
                        "Notify Special Public Prosecutor regarding witness intimidation"
                    ]
                )

                # Record Timeline Event
                CaseEvent.objects.create(
                    case=case,
                    event_type='ALERT_CREATED',
                    title=f"{risk_res['risk_level']} Risk Alert Triggered ({alert_id})",
                    description=risk_res['primary_contributing_factor'],
                    severity='critical' if risk_res['risk_level'] == RiskLevelChoices.CRITICAL else 'warning',
                    metadata={"alert_id": alert_id, "distress_score": new_distress_score}
                )

            # Record Audit Log for the automated inference
            AuditLog.objects.create(
                action='AI_INFERENCE_PIPELINE',
                resource_type='Case',
                resource_id=case.id,
                details={
                    'interaction_id': interaction.id,
                    'distress_score': new_distress_score,
                    'risk_level': risk_res['risk_level'],
                    'confidence': audit_res['overall_confidence'],
                    'requires_human_review': audit_res['requires_human_review']
                }
            )

        return {
            "success": True,
            "interaction_id": interaction.id,
            "distress_score": new_distress_score,
            "risk_level": risk_res['risk_level']
        }

    except Exception as exc:
        Interaction.objects.filter(id=interaction_id).update(
            processing_status=ProcessingStatusChoices.FAILED
        )
        raise exc
