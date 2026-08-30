from typing import Dict, Any

class FeatureAggregator:
    """
    Combines text, voice, behavioral, and metadata features into a standardized feature vector.
    """
    @staticmethod
    def aggregate(
        text_analysis: Dict[str, Any],
        emotion_analysis: Dict[str, Any],
        voice_analysis: Dict[str, Any],
        behavioral_signals: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        behavioral = behavioral_signals or {}

        return {
            "text_distress": float(text_analysis.get('distress_score', 30)),
            "sentiment_score": float(text_analysis.get('sentiment_score', 0)),
            "threat_detected": bool(text_analysis.get('threat_detected', False)),
            "threat_keywords": text_analysis.get('threat_keywords', []),
            "primary_emotion": emotion_analysis.get('primary_emotion', 'Neutral'),
            "emotion_intensity": float(emotion_analysis.get('emotion_confidence', 0.8)),
            "voice_stress": float(voice_analysis.get('voice_stress_score', 30)),
            "voice_stress_level": voice_analysis.get('voice_stress_level', 'Normal'),
            "missed_checkins": int(behavioral.get('missed_checkins', 0)),
            "engagement_delta_percent": float(behavioral.get('engagement_delta_percent', 0.0)),
            "channel": behavioral.get('channel', 'Chatbot'),
        }
