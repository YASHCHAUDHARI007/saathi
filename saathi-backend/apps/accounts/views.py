from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import User, District, State, RoleChoices
from .serializers import (
    UserSerializer,
    DistrictSerializer,
    StateSerializer,
    LoginRequestSerializer,
    RoleSwitchLoginSerializer,
    AuthTokenResponseSerializer,
)

class LoginView(APIView):
    """
    Authenticate user via credentials or fast role-based demonstration token acquisition.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=LoginRequestSerializer,
        responses={200: AuthTokenResponseSerializer}
    )
    def post(self, request):
        serializer = LoginRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "INVALID_CREDENTIALS",
                        "message": "Invalid username or password."
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "data": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            }
        })


class DemoRoleLoginView(APIView):
    """
    SIH Prototype / Demo: Acquire token directly for a specified Role Persona.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=RoleSwitchLoginSerializer,
        responses={200: AuthTokenResponseSerializer}
    )
    def post(self, request):
        serializer = RoleSwitchLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.validated_data['role']

        user = User.objects.filter(role=role).first()
        if not user:
            # Create on-the-fly demo persona user if not seeded yet
            district = District.objects.first()
            user = User.objects.create_user(
                username=f"demo_{role.lower()}",
                email=f"demo_{role.lower()}@saathi.gov.in",
                password="demopassword2026",
                role=role,
                district=district,
                designation=f"Demonstration {role.replace('_', ' ').title()}"
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "data": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            }
        })


class CurrentUserView(APIView):
    """
    Retrieve authenticated user profile and active district/state context.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        return Response({
            "success": True,
            "data": UserSerializer(request.user).data
        })


class UserListView(generics.ListAPIView):
    """
    List active counsellors and district officers for assignment dropdowns.
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['role', 'district']


class DistrictListView(generics.ListAPIView):
    """
    List districts with coordinates for interactive geospatial maps.
    """
    queryset = District.objects.all().select_related('state')
    serializer_class = DistrictSerializer
    permission_classes = [permissions.AllowAny]


class StateListView(generics.ListAPIView):
    """
    List participating states.
    """
    queryset = State.objects.all()
    serializer_class = StateSerializer
    permission_classes = [permissions.AllowAny]
