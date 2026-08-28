from typing import List, Dict, Any

class BaselineEngine:
    """
    Computes and maintains the victim's personal historical distress baseline.
    Avoids comparing victims against arbitrary population averages.
    """
    @staticmethod
    def calculate_baseline(historical_scores: List[float]) -> float:
        if not historical_scores:
            return 35.0
        # Weighted exponential or trimmed average of initial baseline sessions
        sample = historical_scores[:5] if len(historical_scores) >= 5 else historical_scores
        return round(sum(sample) / len(sample), 1)

    @staticmethod
    def compute_deviation(current_score: float, baseline_score: float) -> Dict[str, Any]:
        delta = round(current_score - baseline_score, 1)
        percent_shift = round((delta / baseline_score) * 100, 1) if baseline_score > 0 else 0.0

        if delta > 25:
            severity = "Acute Deviation"
        elif delta > 12:
            severity = "Moderate Deviation"
        elif delta < -10:
            severity = "Positive Improvement"
        else:
            severity = "Baseline Normal"

        return {
            "baseline_score": baseline_score,
            "current_score": current_score,
            "delta_points": delta,
            "percent_shift": percent_shift,
            "deviation_severity": severity
        }
