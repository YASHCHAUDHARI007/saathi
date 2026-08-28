from typing import Dict, Any, List

class AIAuditor:
    """
    AI Safety, Confidence, and Cross-Modal Disagreement Validation Layer.
    Ensures transparent, non-clinical decision-support with mandatory human-in-the-loop flagging.
    """
    CONFIDENCE_THRESHOLD = 0.75
    CROSS_MODAL_THRESHOLD = 0.35

    @classmethod
    def audit_analysis(
        cls,
        text_analysis: Dict[str, Any],
        emotion_analysis: Dict[str, Any],
        voice_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Audit the multimodal inference bundle for consistency and safety.
        """
        text_distress = text_analysis.get('distress_score', 0) / 100.0
        voice_stress = voice_analysis.get('voice_stress_score', 0) / 100.0
        text_conf = text_analysis.get('confidence', 0.8)
        voice_conf = voice_analysis.get('confidence', 0.8)
        emotion_conf = emotion_analysis.get('emotion_confidence', 0.8)

        overall_confidence = round((text_conf * 0.4 + voice_conf * 0.4 + emotion_conf * 0.2), 3)

        # Cross-modal disagreement check
        disagreement_score = round(abs(text_distress - voice_stress), 3)
        has_cross_modal_conflict = disagreement_score > cls.CROSS_MODAL_THRESHOLD

        # Low confidence check
        is_low_confidence = overall_confidence < cls.CONFIDENCE_THRESHOLD

        # Human review determination
        requires_human_review = has_cross_modal_conflict or is_low_confidence or text_analysis.get('threat_detected', False)

        audit_flags = []
        if has_cross_modal_conflict:
            audit_flags.append(f"Cross-modal divergence ({disagreement_score:.2f}): Text distress vs Voice stress disparity.")
        if is_low_confidence:
            audit_flags.append(f"Confidence below threshold ({overall_confidence:.2f} < {cls.CONFIDENCE_THRESHOLD}).")
        if text_analysis.get('threat_detected', False):
            audit_flags.append("Explicit threat/intimidation keywords flagged for urgent supervisory review.")

        audit_reasoning = (
            "Verified by SAATHI Multi-Modal Audit Layer. " +
            (" " .join(audit_flags) if audit_flags else "Signals are consistent across text and acoustic modalities.")
        )

        return {
            "overall_confidence": overall_confidence,
            "disagreement_score": disagreement_score,
            "has_cross_modal_conflict": has_cross_modal_conflict,
            "is_low_confidence": is_low_confidence,
            "requires_human_review": requires_human_review,
            "audit_flags": audit_flags,
            "audit_reasoning": audit_reasoning,
            "decision_support_disclaimer": "This output is a non-clinical decision-support indicator intended solely for protective administrative monitoring under the SC/ST (PoA) Act."
        }
