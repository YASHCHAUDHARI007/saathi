from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

v1_patterns = [
    path('auth/', include('apps.accounts.urls')),
    path('cases/', include('apps.cases.urls')),
    path('interactions/', include('apps.interactions.urls')),
    path('ai/', include('apps.ai_analysis.urls')),
    path('risk/', include('apps.risk.urls')),
    path('alerts/', include('apps.alerts.urls')),
    path('interventions/', include('apps.interventions.urls')),
    path('integrations/', include('apps.integrations.urls')),
    path('analytics/', include('apps.analytics.urls')),
    path('notifications/', include('apps.notifications.urls')),
    path('audit/', include('apps.audit.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),

    # OpenAPI Schema & Interactive Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Both /api/v1/ and /api/ prefixes
    path('api/v1/', include(v1_patterns)),
    path('api/', include(v1_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
