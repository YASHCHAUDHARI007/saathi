from typing import Dict, Any, Optional
from django.db import transaction
from django.utils import timezone
from .models import DepartmentIntegration, IntegrationEvent, DepartmentCodeChoices
from apps.cases.models import Case, CaseEvent, CaseStageChoices

class DepartmentSimulatorService:
    """
    Simulates inbound webhooks/events from external eCourts, CCTNS/Police, DLSA, and Social Justice.
    """
    SIMULATION_TEMPLATES = {
        'BAIL_HEARING_SCHEDULED': {
            'dept': DepartmentCodeChoices.COURT,
            'summary': 'eCourts: Accused filed Interim Bail Application; Hearing listed for Friday.',
            'stage': CaseStageChoices.INVESTIGATION,
            'severity': 'warning',
            'distress_impact': +8
        },
        'BAIL_GRANTED': {
            'dept': DepartmentCodeChoices.COURT,
            'summary': 'eCourts: Interim Bail granted to accused with local jurisdiction restrictions.',
            'stage': CaseStageChoices.INVESTIGATION,
            'severity': 'critical',
            'distress_impact': +15
        },
        'CHARGE_SHEET_FILED': {
            'dept': DepartmentCodeChoices.POLICE,
            'summary': 'CCTNS: Formal charge-sheet submitted in Special SC/ST Court within statutory 60 days.',
            'stage': CaseStageChoices.TRIAL,
            'severity': 'info',
            'distress_impact': -4
        },
        'WITNESS_INTIMIDATION_REPORTED': {
            'dept': DepartmentCodeChoices.POLICE,
            'summary': 'Police Beat Unit: Complaint of suspicious movement and verbal warning near residence.',
            'stage': CaseStageChoices.INVESTIGATION,
            'severity': 'critical',
            'distress_impact': +20
        },
        'RELIEF_DISBURSED': {
            'dept': DepartmentCodeChoices.SOCIAL_JUSTICE,
            'summary': 'DBT: Immediate monetary relief of ₹1,00,000 credited to victim Aadhaar-linked account.',
            'stage': CaseStageChoices.COMPENSATION,
            'severity': 'success',
            'distress_impact': -10
        },
        'POLICE_PROTECTION_DEPLOYED': {
            'dept': DepartmentCodeChoices.WITNESS_PROTECTION,
            'summary': 'Witness Protection: Round-the-clock armed constable escort posted for hearing day.',
            'stage': CaseStageChoices.TRIAL,
            'severity': 'success',
            'distress_impact': -12
        }
    }

    @classmethod
    @transaction.atomic
    def ingest_event(
        cls,
        case: Case,
        event_code: str,
        custom_summary: Optional[str] = None,
        custom_payload: Optional[Dict[str, Any]] = None
    ) -> IntegrationEvent:
        template = cls.SIMULATION_TEMPLATES.get(event_code, {
            'dept': DepartmentCodeChoices.POLICE,
            'summary': custom_summary or 'Inter-agency departmental status update.',
            'stage': case.current_stage,
            'severity': 'info',
            'distress_impact': 0
        })

        dept, _ = DepartmentIntegration.objects.get_or_create(
            code=template['dept'],
            defaults={'name': template['dept'].replace('_', ' ').title()}
        )

        summary = custom_summary or template['summary']
        payload = custom_payload or {'template_code': event_code, 'impact': template['distress_impact']}

        event = IntegrationEvent.objects.create(
            department=dept,
            case=case,
            event_type=event_code,
            external_reference=f"EXT-REF-{timezone.now().strftime('%d%H%M')}",
            summary=summary,
            payload=payload
        )

        # Update Case stage if changed
        if template.get('stage') and case.current_stage != template['stage']:
            case.current_stage = template['stage']

        # Adjust distress score safely
        impact = template.get('distress_impact', 0)
        if impact != 0:
            case.distress_score = max(5, min(98, case.distress_score + impact))
            case.trend_delta = f"{'+' if impact > 0 else ''}{impact} (Dept Event)"
            case.monitoring_status = 'Elevated' if case.distress_score >= 60 else case.monitoring_status

        case.save()

        # Emit audit-grade CaseEvent timeline
        CaseEvent.objects.create(
            case=case,
            event_type=f"DEPT_{event_code}",
            title=f"[{dept.name.split('(')[0].strip()}] {event_code.replace('_', ' ').title()}",
            description=summary,
            severity=template['severity'],
            metadata=payload
        )

        return event
