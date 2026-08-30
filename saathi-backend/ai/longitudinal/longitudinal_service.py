from typing import List, Dict, Any

class LongitudinalEngine:
    """
    Analyzes temporal patterns, 7-day velocity, acceleration, and missed check-in dropouts.
    """
    @staticmethod
    def calculate_velocity_and_trend(trajectory: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not trajectory or len(trajectory) == 0:
            return {
                "trend_direction": "stable",
                "trend_delta_label": "→ 0 (7d)",
                "velocity_points_per_week": 0.0,
                "consecutive_increases": 0,
                "engagement_trend": "Stable"
            }

        scores = [p.get('distress_score', p.get('distressScore', 35)) for p in trajectory]
        current_score = scores[-1]
        
        # 7-day previous score (or previous data point)
        prev_score = scores[-2] if len(scores) >= 2 else current_score
        delta = current_score - prev_score

        if delta > 8:
            direction = "increasing"
            label = f"↑ +{delta} (7d)"
        elif delta < -8:
            direction = "decreasing"
            label = f"↓ {delta} (7d)"
        else:
            direction = "stable"
            label = f"→ {'+' if delta >= 0 else ''}{delta} (7d)"

        # Check for consecutive upward drift
        consecutive_increases = 0
        for i in range(len(scores) - 1, 0, -1):
            if scores[i] > scores[i - 1]:
                consecutive_increases += 1
            else:
                break

        return {
            "trend_direction": direction,
            "trend_delta_label": label,
            "velocity_points_per_week": float(delta),
            "consecutive_increases": consecutive_increases,
            "is_rapid_escalation": consecutive_increases >= 3 or delta >= 15
        }
