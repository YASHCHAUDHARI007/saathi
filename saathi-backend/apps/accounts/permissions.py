from rest_framework.permissions import BasePermission
from .models import RoleChoices

class IsDistrictOfficer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == RoleChoices.DISTRICT_OFFICER)

class IsCounsellor(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == RoleChoices.COUNSELLOR)

class IsStateAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == RoleChoices.STATE_ADMIN)

class IsNationalAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == RoleChoices.NATIONAL_ADMIN)

class HasCaseAccess(BasePermission):
    """
    Object-level permission enforcing geographic & assignment constraints:
    - National Admin: Access all cases.
    - State Admin: Access cases in their designated state.
    - District Officer: Access cases in their designated district.
    - Counsellor: Access assigned cases or district cases.
    - Victim/Citizen: Access only their own case.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser or user.role == RoleChoices.NATIONAL_ADMIN:
            return True

        # Extract case reference
        case = obj if hasattr(obj, 'current_stage') else getattr(obj, 'case', None)
        if not case:
            return True

        if user.role == RoleChoices.STATE_ADMIN:
            return user.state_id == case.district.state_id or user.state == case.state_name

        if user.role == RoleChoices.DISTRICT_OFFICER:
            return user.district_id == case.district_id or user.district == case.district_name

        if user.role == RoleChoices.COUNSELLOR:
            return case.assigned_counsellor_id == user.id or user.district_id == case.district_id

        if user.role == RoleChoices.VICTIM_CITIZEN:
            return hasattr(case, 'subject') and case.subject.user_id == user.id

        return False
