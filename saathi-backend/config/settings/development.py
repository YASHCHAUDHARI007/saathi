from .base import *

DEBUG = True

# For local development without PostgreSQL running, support SQLite fallback smoothly,
# while reading DB_ENGINE if configured.
if os.getenv('USE_POSTGRES', 'False').lower() in ('true', '1'):
    DATABASES = {
        'default': {
            'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.postgresql'),
            'NAME': os.getenv('DB_NAME', 'saathi_db'),
            'USER': os.getenv('DB_USER', 'saathi_user'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'saathi_secure_pass_2026'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# In-memory or Redis broker for development Celery
CELERY_TASK_ALWAYS_EAGER = os.getenv('CELERY_ALWAYS_EAGER', 'True').lower() in ('true', '1')
CELERY_TASK_EAGER_PROPAGATES = True
