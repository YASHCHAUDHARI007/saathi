from typing import Optional, Dict, Any, List
from django.db import transaction
from django.utils import timezone
from .models import Case, CaseEvent, CaseMilestone, Subject, CaseStageChoices, RiskLevelChoices
from apps.accounts.models import District, State, User

class CaseService:
    @staticmethod
    @transaction.atomic
    def create_case(
        case_id: str,
        anonymous_id: str,
        case_type: str,
        district: District,
        state: State,
        subject_role: str = 'Victim',
        current_stage: str = CaseStageChoices.INVESTIGATION,
        assigned_counsellor: Optional[User] = None,
        fir_number: str = "",
        created_by: Optional[User] = None
    ) -> Case:
        subject, _ = Subject.objects.get_or_create(
            anonymous_id=anonymous_id,
            defaults={'role': subject_role}
        )

        case = Case.objects.create(
            id=case_id,
            subject=subject,
            case_type=case_type,
            district=district,
            state=state,
            current_stage=current_stage,
            assigned_counsellor=assigned_counsellor,
            fir_number=fir_number,
            distress_score=35,
            baseline_score=35,
            risk_level=RiskLevelChoices.LOW
        )

        # Record Genesis Event
        CaseEvent.objects.create(
            case=case,
            event_type='CASE_CREATED',
            title='Case Intake & Protection Profile Initialized',
            description=f'Case {case_id} registered in {district.name} under {case_type}.',
            severity='info',
            created_by=created_by
        )

        return case

    @staticmethod
    def record_timeline_event(
        case: Case,
        event_type: str,
        title: str,
        description: str = "",
        severity: str = 'info',
        metadata: Optional[Dict[str, Any]] = None,
        created_by: Optional[User] = None
    ) -> CaseEvent:
        return CaseEvent.objects.create(
            case=case,
            event_type=event_type,
            title=title,
            description=description,
            severity=severity,
            metadata=metadata or {},
            created_by=created_by
        )

    @staticmethod
    @transaction.atomic
    def assign_counsellor(case: Case, counsellor: User, phone: Optional[str] = None, assigned_by: Optional[User] = None) -> Case:
        case.assigned_counsellor = counsellor
        if phone:
            case.counsellor_phone = phone
        elif counsellor.phone_number:
            case.counsellor_phone = counsellor.phone_number
        case.save(update_fields=['assigned_counsellor', 'counsellor_phone', 'updated_at'])

        CaseEvent.objects.create(
            case=case,
            event_type='COUNSELLOR_ASSIGNED',
            title=f'Counsellor Assigned: {counsellor.get_full_name() or counsellor.username}',
            description=f'Dedicated clinical officer assigned for longitudinal monitoring.',
            severity='info',
            created_by=assigned_by
        )
        return case

    @staticmethod
    @transaction.atomic
    def trigger_victim_sos(
        case: Case,
        threat_details: str,
        location: str = "Location Shared via Mobile App",
        triggered_by: Optional[User] = None
    ) -> CaseEvent:
        case.distress_score = min(100, case.distress_score + 15)
        case.risk_level = RiskLevelChoices.CRITICAL
        case.monitoring_status = 'Elevated'
        case.save(update_fields=['distress_score', 'risk_level', 'monitoring_status', 'updated_at'])

        event = CaseEvent.objects.create(
            case=case,
            event_type='SOS_TRIGGERED',
            title='EMERGENCY CITIZEN SOS TRIGGERED',
            description=f'{threat_details} (Location: {location})',
            severity='critical',
            metadata={'location': location, 'details': threat_details},
            created_by=triggered_by
        )
        return event
