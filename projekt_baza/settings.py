from pathlib import Path
import os

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def env_list(name: str, default: list[str] | None = None) -> list[str]:
    raw = os.getenv(name, '')
    values = [item.strip() for item in raw.split(',') if item.strip()]
    return values or (default or [])


SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dev-only-change-me')
DEBUG = env_bool('DEBUG', True)

ALLOWED_HOSTS = env_list('ALLOWED_HOSTS', ['127.0.0.1', 'localhost'] if DEBUG else [])
CSRF_TRUSTED_ORIGINS = env_list(
    'CSRF_TRUSTED_ORIGINS',
    ['http://127.0.0.1:8000', 'http://localhost:8000'] if DEBUG else [],
)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'users',
    'ares',
    'widget_tweaks',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'projekt_baza.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'projekt_baza.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=env_bool('DATABASE_SSL_REQUIRE', False),
    )
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'pl'
TIME_ZONE = 'Europe/Warsaw'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# E-mail delivery
# Podejście wzorowane na SleepWatch: jednym przełącznikiem wybieramy tryb wysyłki.
# - console: lokalnie pokazuje wiadomość w terminalu, bez prawdziwego SMTP
# - file: zapisuje wiadomości do katalogu sent_emails/
# - gmail: używa Gmail SMTP z hasłem aplikacji Google
# - smtp: używa dowolnego SMTP z wartości z Environment Variables
EMAIL_DELIVERY_MODE = os.getenv(
    'EMAIL_DELIVERY_MODE',
    'console' if DEBUG else 'gmail',
).strip().lower()

if EMAIL_DELIVERY_MODE == 'gmail':
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
    EMAIL_USE_TLS = env_bool('EMAIL_USE_TLS', True)
    EMAIL_USE_SSL = env_bool('EMAIL_USE_SSL', False)
    EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', '20'))
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
    DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL') or EMAIL_HOST_USER or 'noreply@ares.local'
elif EMAIL_DELIVERY_MODE == 'smtp':
    EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
    EMAIL_HOST = os.getenv('EMAIL_HOST', '')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
    EMAIL_USE_TLS = env_bool('EMAIL_USE_TLS', True)
    EMAIL_USE_SSL = env_bool('EMAIL_USE_SSL', False)
    EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', '20'))
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
    DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL') or EMAIL_HOST_USER or 'noreply@ares.local'
elif EMAIL_DELIVERY_MODE == 'file':
    EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
    EMAIL_FILE_PATH = BASE_DIR / 'sent_emails'
    EMAIL_HOST = os.getenv('EMAIL_HOST', '')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
    EMAIL_USE_TLS = env_bool('EMAIL_USE_TLS', True)
    EMAIL_USE_SSL = env_bool('EMAIL_USE_SSL', False)
    EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', '20'))
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
    DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'ARES <noreply@ares.local>')
else:
    EMAIL_DELIVERY_MODE = 'console'
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    EMAIL_HOST = os.getenv('EMAIL_HOST', '')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
    EMAIL_USE_TLS = env_bool('EMAIL_USE_TLS', True)
    EMAIL_USE_SSL = env_bool('EMAIL_USE_SSL', False)
    EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', '20'))
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
    DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'ARES <noreply@ares.local>')

SERVER_EMAIL = os.getenv('SERVER_EMAIL', DEFAULT_FROM_EMAIL)

# Tryb awaryjny dla rejestracji, gdy SMTP nie jest jeszcze poprawnie ustawiony.
# User nadal powstaje dopiero po wpisaniu kodu. W produkcji docelowo ustaw False,
# a prawdziwe dane SMTP ustaw w Render → Environment Variables.
EMAIL_VERIFICATION_CODE_ON_SCREEN = env_bool('EMAIL_VERIFICATION_CODE_ON_SCREEN', True)
EMAIL_VERIFICATION_LOG_CODE = env_bool('EMAIL_VERIFICATION_LOG_CODE', True)


SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = env_bool('SESSION_COOKIE_SECURE', not DEBUG)
CSRF_COOKIE_SECURE = env_bool('CSRF_COOKIE_SECURE', not DEBUG)
SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', False)
