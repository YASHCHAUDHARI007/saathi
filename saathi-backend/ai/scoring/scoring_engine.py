from typing import Dict, Any
from django.conf import settings

class ScoringEngine:
    """
    Multimodal Weighted Scoring Engine.
    Formula:
    Distress = w1*TextDistress + w2*VoiceStress + w3*EmotionSignal + w4*LongitudinalTrend + w5*BaselineDev + w6*EngagementLoss
    """
    DEFAULT_WEIGHTS = {
        'text_distress': 0.35,
        'voice_stress': 0.20,
        'emotion_signal': 0.10,
        'longitudinal_trend': 0.15,
        'baseline_deviation': 0.10,
        'engagement_change': 0.10,
    }

    @classmethod
    def compute_composite_score(
        cls,
        features: Dict[str, Any],
        baseline_deviation: Dict[str, Any],
        longitudinal_stats: Dict[str, Any],
        custom_weights: Dict[str, float] = None
    ) -> Dict[str, Any]:
        weights = custom_weights or getattr(settings, 'SCORING_WEIGHTS', cls.DEFAULT_WEIGHTS)

        # 1. Text distress component (0-100)
        c_text = features.get('text_distress', 30.0)

        # 2. Voice stress component (0-100)
        c_voice = features.get('voice_stress', 30.0)

        # 3. Emotion signal component (0-100)
        emotion_map = {'Fear': 90, 'Anger': 75, 'Grief / Sadness': 80, 'Anxiety': 70, 'Relief': 20, 'Hope': 15, 'Neutral': 30}
        c_emotion = float(emotion_map.get(features.get('primary_emotion', 'Neutral'), 35))

        # 4. Longitudinal trend component (0-100)
        velocity = longitudinal_stats.get('velocity_points_per_week', 0.0)
        c_trend = max(0, min(100, 40 + velocity * 3.5))

        # 5. Baseline deviation component (0-100)
        delta_points = baseline_deviation.get('delta_points', 0.0)
        c_baseline = max(0, min(100, 35 + delta_points * 2.2))

        # 6. Engagement loss component (0-100)
        missed = features.get('missed_checkins', 0)
        c_engagement = min(100, missed * 30 + 15)

        raw_score = (
            weights['text_distress'] * c_text +
            weights['voice_stress'] * c_voice +
            weights['emotion_signal'] * c_emotion +
            weights['longitudinal_trend'] * c_trend +
            weights['baseline_deviation'] * c_baseline +
            weights['engagement_change'] * c_engagement
        )

        composite_score = int(round(max(5, min(98, raw_score))))

        return {
            "composite_distress_score": composite_score,
            "sub_components": {
                "text_component": round(c_text, 1),
                "voice_component": round(c_voice, 1),
                "emotion_component": round(c_emotion, 1),
                "longitudinal_component": round(c_trend, 1),
                "baseline_component": round(c_baseline, 1),
                "engagement_component": round(c_engagement, 1),
            },
            "applied_weights": weights
        }
