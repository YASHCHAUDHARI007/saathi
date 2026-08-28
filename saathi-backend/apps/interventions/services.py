from typing import Optional
from django.utils import timezone
from django.db import transaction
from .models import Intervention, InterventionStatusChoices
from apps.cases.models import Case, CaseEvent
from apps.accounts.models import User

class InterventionService:
    @staticmethod
    @transaction.atomic
    def create_intervention(
        case: Case,
        intervention_type: str,
        title: str,
        description: str = "",
        priority: str = "P2",
        assigned_to: Optional[User] = None,
        assigned_to_name: str = "",
        department: str = "District Legal Services Authority (DLSA)",
        target_date: str = "",
        notes: str = "",
        created_by: Optional[User] = None
    ) -> Intervention:
        import uuid
        intervention_id = f"INTV-{timezone.now().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"

        intervention = Intervention.objects.create(
            id=intervention_id,
            case=case,
            type=intervention_type,
            title=title,
            description=description,
            priority=priority,
            assigned_to=assigned_to,
            assigned_to_name=assigned_to_name or (assigned_to.get_full_name() if assigned_to else "Assigned Officer"),
            department=department,
            target_date=target_date or (timezone.now() + timezone.timedelta(days=7)).strftime("%Y-%m-%d"),
            notes=notes
        )

        CaseEvent.objects.create(
            case=case,
            event_type='INTERVENTION_ASSIGNED',
            title=f'Intervention Created: {title}',
            description=f'Assigned to {intervention.assigned_to_name} ({department}).',
            severity='info',
            created_by=created_by
        )
        return intervention

    @staticmethod
    @transaction.atomic
    def update_status(
        intervention: Intervention,
        new_status: str,
        notes: str = "",
        updated_by: Optional[User] = None
    ) -> Intervention:
        intervention.status = new_status
        if new_status == InterventionStatusChoices.COMPLETED:
            intervention.completed_date = timezone.now().strftime("%Y-%m-%d")
        if notes:
            intervention.notes = notes
        intervention.save()

        CaseEvent.objects.create(
            case=intervention.case,
            event_type='INTERVENTION_STATUS_UPDATED',
            title=f'Intervention Status: {intervention.title} -> {new_status}',
            description=notes or f"Updated to {new_status}.",
            severity='success' if new_status == InterventionStatusChoices.COMPLETED else 'info',
            created_by=updated_by
        )
        return intervention
