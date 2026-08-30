from typing import Dict, Any, List
from apps.cases.models import RiskLevelChoices

class RiskEngine:
    """
    Evaluates composite distress scores, threat signals, velocity, and institutional events
    to classify into four risk tiers: LOW, MODERATE, HIGH, CRITICAL.
    Generates plain-language explainability breakdown and contributing factor points.
    """
    @classmethod
    def evaluate_risk(
        cls,
        distress_score: int,
        features: Dict[str, Any],
        baseline_deviation: Dict[str, Any],
        longitudinal_stats: Dict[str, Any]
    ) -> Dict[str, Any]:
        threat_detected = features.get('threat_detected', False)
        velocity = longitudinal_stats.get('velocity_points_per_week', 0)
        missed = features.get('missed_checkins', 0)
        
        # Determine Risk Tier
        if threat_detected or distress_score >= 80:
            risk_level = RiskLevelChoices.CRITICAL if threat_detected and distress_score >= 75 else RiskLevelChoices.HIGH
        elif distress_score >= 60:
            risk_level = RiskLevelChoices.HIGH
        elif distress_score >= 30:
            risk_level = RiskLevelChoices.MODERATE
        else:
            risk_level = RiskLevelChoices.LOW

        # Generate Explainability Contributing Factors (similar to frontend cards)
        factors = []
        
        if velocity > 5:
            factors.append({
                "factor": "Rapid increase in distress score",
                "points": 18,
                "category": "Trend",
                "description": f"Longitudinal distress accelerated +{int(velocity)} pts over previous periods."
            })
        
        if features.get('sentiment_score', 0) < -30:
            factors.append({
                "factor": "Negative sentiment trend",
                "points": 14,
                "category": "Sentiment",
                "description": "Semantic polarity shifted significantly into dread and anxiety markers."
            })

        if threat_detected:
            keywords_str = ", ".join(f'"{kw}"' for kw in features.get('threat_keywords', [])[:3])
            factors.append({
                "factor": "Threat-related language detected",
                "points": 22,
                "category": "Threat",
                "description": f"Keywords relating to surveillance/intimidation identified: {keywords_str or 'threat markers'}."
            })

        if features.get('voice_stress', 0) > 60:
            factors.append({
                "factor": "Elevated voice acoustic tremor",
                "points": 11,
                "category": "Acoustic",
                "description": "Acoustic micro-tremor and vocal tension elevated above baseline threshold."
            })

        if missed > 0:
            factors.append({
                "factor": "Missed follow-up interactions",
                "points": 8 * missed,
                "category": "Behavioral",
                "description": f"{missed} consecutive scheduled check-ins unanswered."
            })

        # Primary contributing factor label
        if threat_detected:
            primary_factor = "Explicit intimidation and threat language flagged during latest interaction."
        elif velocity > 8:
            primary_factor = f"Rapid upward escalation in longitudinal distress trend (+{int(velocity)} pts)."
        elif features.get('voice_stress', 0) > 70:
            primary_factor = "Significant vocal acoustic tremor and tension detected during IVRS check-in."
        else:
            primary_factor = "Routine baseline variance within nominal protective threshold."

        ai_summary = (
            f"Multi-modal decision-support evaluation classifies vulnerability as {risk_level}. "
            f"{primary_factor} "
            f"Identified {len(factors)} key contributing factor(s). Human clinical review recommended."
        )

        return {
            "risk_level": risk_level,
            "primary_contributing_factor": primary_factor,
            "ai_explanation_summary": ai_summary,
            "contributing_factors": factors,
            "requires_immediate_alert": risk_level in [RiskLevelChoices.HIGH, RiskLevelChoices.CRITICAL]
        }
