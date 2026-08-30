from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    DemoRoleLoginView,
    CurrentUserView,
    UserListView,
    DistrictListView,
    StateListView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('demo-login/', DemoRoleLoginView.as_view(), name='auth-demo-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    path('users/', UserListView.as_view(), name='auth-users'),
    path('districts/', DistrictListView.as_view(), name='auth-districts'),
    path('states/', StateListView.as_view(), name='auth-states'),
]
