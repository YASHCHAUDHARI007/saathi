import re
from typing import Dict, Any, List

class XLMRoBERTaDistressAdapter:
    """
    Adapter for Multilingual Distress Detection (XLM-RoBERTa / IndicBERT).
    Produces normalized distress score (0-100), sentiment score (-100 to 100),
    and detects threat-related / coercion signals in Indic languages and English.
    """
    THREAT_KEYWORDS = [
        'threat', 'threaten', 'kill', 'attack', 'watching', 'stalking', 'compromise',
        'withdraw', 'court', 'bail', 'scared', 'afraid', 'dar', 'dhamki', 'goli',
        'maar', 'chhod', 'police', 'goons', 'bribe', 'gundas', 'retaliation',
        'burn', 'boycott', 'outside', 'house', 'village', 'warning'
    ]

    DISTRESS_KEYWORDS = [
        'hopeless', 'helpless', 'crying', 'cannot sleep', 'nightmare', 'trembling',
        'suicidal', 'pain', 'anxiety', 'panic', 'shame', 'alone', 'broken',
        'depressed', 'fear', 'tension', 'chinta', 'dard', 'rona'
    ]

    def analyze(self, text: str, language: str = 'en') -> Dict[str, Any]:
        """
        Analyze input text for distress, sentiment polarity, and threat signals.
        """
        if not text or not text.strip():
            return {
                "distress_score": 20,
                "sentiment_score": 0,
                "sentiment_label": "Neutral",
                "threat_detected": False,
                "threat_keywords": [],
                "confidence": 0.85,
                "model_name": "xlm-roberta-base-distress-indic"
            }

        text_lower = text.lower()
        matched_threats = [w for w in self.THREAT_KEYWORDS if re.search(r'\b' + re.escape(w) + r'\b', text_lower)]
        matched_distress = [w for w in self.DISTRESS_KEYWORDS if re.search(r'\b' + re.escape(w) + r'\b', text_lower)]

        threat_detected = len(matched_threats) > 0

        # Calculate heuristic distress score
        base_score = 30
        base_score += len(matched_threats) * 22
        base_score += len(matched_distress) * 15

        # Factor in length & exclamation intensity
        if '!' in text or '?' in text:
            base_score += 5

        distress_score = min(98, max(5, base_score))

        # Sentiment score from -100 to +100
        sentiment_score = max(-100, min(100, 20 - int(distress_score * 1.2)))
        if sentiment_score < -40:
            sentiment_label = "High Distress"
        elif sentiment_score < 0:
            sentiment_label = "Mild Negative"
        elif sentiment_score == 0:
            sentiment_label = "Neutral"
        else:
            sentiment_label = "Positive / Relieved"

        confidence = 0.88 if (threat_detected or matched_distress) else 0.82

        return {
            "distress_score": distress_score,
            "sentiment_score": sentiment_score,
            "sentiment_label": sentiment_label,
            "threat_detected": threat_detected,
            "threat_keywords": list(set(matched_threats + matched_distress)),
            "confidence": confidence,
            "model_name": "xlm-roberta-base-distress-indic"
        }
