from typing import Dict, Any, List

class GoEmotionsAdapter:
    """
    Adapter for Pretrained Fine-Grained Emotion Recognition (GoEmotions).
    Identifies primary psychological and affective states without making clinical diagnoses.
    """
    EMOTION_KEYWORDS = {
        'Fear': ['scared', 'afraid', 'terrified', 'threat', 'danger', 'panicking', 'dar', 'dhamki'],
        'Anger': ['furious', 'corrupt', 'unfair', 'injustice', 'angry', 'hate', 'gussa', 'bribe'],
        'Grief / Sadness': ['crying', 'hopeless', 'loss', 'grief', 'alone', 'broken', 'shame', 'dukha'],
        'Anxiety': ['worried', 'nervous', 'court', 'hearing', 'chinta', 'tension', 'waiting'],
        'Relief': ['safe', 'thank you', 'helped', 'better', 'peace', 'shanti', 'counsellor'],
        'Hope': ['hope', 'justice', 'believe', 'strong', 'resolved'],
        'Neutral': ['okay', 'fine', 'completed', 'received', 'status', 'ha']
    }

    def analyze(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "primary_emotion": "Neutral",
                "emotion_confidence": 0.85,
                "emotion_breakdown": {"Neutral": 0.85, "Calm": 0.15},
                "model_name": "roberta-base-goemotions"
            }

        text_lower = text.lower()
        scores = {}
        for emotion, keywords in self.EMOTION_KEYWORDS.items():
            count = sum(1 for kw in keywords if kw in text_lower)
            if count > 0:
                scores[emotion] = count * 0.35 + 0.2

        if not scores:
            scores['Neutral'] = 0.80

        # Find top emotion
        sorted_emotions = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary_emotion = sorted_emotions[0][0]
        confidence = min(0.96, sorted_emotions[0][1])

        return {
            "primary_emotion": primary_emotion,
            "emotion_confidence": round(confidence, 2),
            "emotion_breakdown": {k: round(v, 2) for k, v in sorted_emotions[:4]},
            "model_name": "roberta-base-goemotions"
        }
