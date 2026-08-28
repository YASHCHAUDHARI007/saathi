import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class RoleChoices(models.TextChoices):
    DISTRICT_OFFICER = 'DISTRICT_OFFICER', 'District Officer'
    COUNSELLOR = 'COUNSELLOR', 'Counsellor'
    STATE_ADMIN = 'STATE_ADMIN', 'State Administrator'
    NATIONAL_ADMIN = 'NATIONAL_ADMIN', 'National Administrator'
    VICTIM_CITIZEN = 'VICTIM_CITIZEN', 'Victim / Citizen'


class State(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class District(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    coord_x = models.FloatField(default=0.0, help_text="Normalized X coordinate for canvas mapping")
    coord_y = models.FloatField(default=0.0, help_text="Normalized Y coordinate for canvas mapping")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['state__name', 'name']
        unique_together = ('state', 'name')

    def __str__(self):
        return f"{self.name}, {self.state.name}"


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=30,
        choices=RoleChoices.choices,
        default=RoleChoices.DISTRICT_OFFICER,
        db_index=True
    )
    district = models.ForeignKey(
        District,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='officers'
    )
    state = models.ForeignKey(
        State,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='state_officers'
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    designation = models.CharField(max_length=150, blank=True, default="")
    badge_number = models.CharField(max_length=50, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Resolve AbstractUser related_name clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='saathi_user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='saathi_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    @property
    def display_role(self):
        return self.get_role_display()
