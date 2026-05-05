import base64
import uuid

from django.core.files.base import ContentFile
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=30)  # ważny 30 minut
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.code}"


class PendingRegistration(models.Model):
    """Tymczasowa rejestracja. Konto User powstaje dopiero po poprawnej weryfikacji e-mail."""

    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)
    verification_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    last_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['expires_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=30)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return self.expires_at < timezone.now()

    def refresh_code(self, code):
        self.verification_code = code
        self.expires_at = timezone.now() + timedelta(minutes=30)
        self.last_sent_at = timezone.now()
        self.save(update_fields=['verification_code', 'expires_at', 'last_sent_at', 'updated_at'])

    def __str__(self):
        return f'Oczekująca rejestracja: {self.username} <{self.email}>'


class UserProfile(models.Model):
    """Ustawienia profilu i wyglądu przypisane do zalogowanego użytkownika."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ares_profile')
    display_name = models.CharField(max_length=100, blank=True)
    avatar_text = models.CharField(max_length=10, default='A')
    avatar_style = models.CharField(max_length=255, blank=True, default='linear-gradient(135deg, #6ea8ff, #3d62ff)')
    avatar_shape = models.CharField(max_length=50, default='rounded')
    avatar_image = models.TextField(blank=True, default='')
    avatar_file = models.FileField(upload_to='avatars/', blank=True, null=True)
    theme = models.CharField(max_length=80, default='midnight-blue')
    shortcuts = models.JSONField(default=dict, blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def _decode_avatar_data_uri(value):
        """Zamienia obrazek base64 z frontendu na plik możliwy do zapisania w media/avatars/."""
        if not isinstance(value, str) or not value.startswith('data:image/') or ';base64,' not in value:
            return None
        header, encoded = value.split(';base64,', 1)
        extension = header.split('data:image/', 1)[1].split(';', 1)[0].lower()
        if extension == 'jpeg':
            extension = 'jpg'
        if extension not in {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg+xml'}:
            extension = 'png'
        if extension == 'svg+xml':
            extension = 'svg'
        try:
            raw = base64.b64decode(encoded)
        except Exception:
            return None
        filename = f'avatar_{uuid.uuid4().hex}.{extension}'
        return filename, ContentFile(raw, name=filename)

    def avatar_url(self):
        if self.avatar_file:
            try:
                return self.avatar_file.url
            except Exception:
                return ''
        return self.avatar_image or ''

    def is_default_profile(self):
        defaults = self.defaults_for_user(self.user)
        profile = defaults['profile']
        return (
            (self.display_name or self.user.username) == profile['displayName']
            and (self.avatar_text or profile['avatarText']) == profile['avatarText']
            and (self.avatar_style or profile['avatarStyle']) == profile['avatarStyle']
            and (self.avatar_shape or profile['avatarShape']) == profile['avatarShape']
            and not self.avatar_image
            and not self.avatar_file
            and (self.theme or defaults['theme']) == defaults['theme']
            and {**defaults['shortcuts'], **(self.shortcuts or {})} == defaults['shortcuts']
            and {**defaults['preferences'], **(self.preferences or {})} == defaults['preferences']
        )

    @staticmethod
    def default_shortcuts():
        return {
            'worksheets': True,
            'import': True,
            'reports': True,
            'history': True,
            'charts': True,
            'solver': True,
            'math': True,
            'merge': True,
        }

    @staticmethod
    def default_preferences():
        return {
            'showClock': True,
            'compactSidebar': False,
            'confirmActions': True,
            'showTips': True,
            'showQuickDock': True,
        }

    @classmethod
    def defaults_for_user(cls, user):
        initial = (user.username or 'A')[:1].upper()
        return {
            'profile': {
                'displayName': user.username,
                'avatarText': initial,
                'avatarStyle': 'linear-gradient(135deg, #6ea8ff, #3d62ff)',
                'avatarImage': '',
                'avatarShape': 'rounded',
            },
            'theme': 'midnight-blue',
            'shortcuts': cls.default_shortcuts(),
            'preferences': cls.default_preferences(),
        }

    def to_payload(self):
        defaults = self.defaults_for_user(self.user)
        return {
            'profile': {
                'displayName': self.display_name or self.user.username,
                'avatarText': self.avatar_text or defaults['profile']['avatarText'],
                'avatarStyle': self.avatar_style or defaults['profile']['avatarStyle'],
                'avatarImage': self.avatar_url(),
                'avatarShape': self.avatar_shape or 'rounded',
            },
            'theme': self.theme or defaults['theme'],
            'shortcuts': {**defaults['shortcuts'], **(self.shortcuts or {})},
            'preferences': {**defaults['preferences'], **(self.preferences or {})},
            'isDefaultProfile': self.is_default_profile(),
        }

    def apply_payload(self, payload):
        profile = payload.get('profile') or {}
        if 'displayName' in profile:
            self.display_name = str(profile.get('displayName') or '')[:100]
        if 'avatarText' in profile:
            self.avatar_text = str(profile.get('avatarText') or 'A')[:10]
        if 'avatarStyle' in profile:
            self.avatar_style = str(profile.get('avatarStyle') or '')[:255]
        if 'avatarShape' in profile:
            self.avatar_shape = str(profile.get('avatarShape') or 'rounded')[:50]
        if 'avatarImage' in profile:
            raw_avatar = str(profile.get('avatarImage') or '')
            decoded = self._decode_avatar_data_uri(raw_avatar)
            if decoded:
                filename, content = decoded
                if self.avatar_file:
                    self.avatar_file.delete(save=False)
                self.avatar_file.save(filename, content, save=False)
                self.avatar_image = ''
            elif raw_avatar:
                # Zewnętrzny URL albo istniejąca ścieżka /media/ zostaje jako tekst.
                # Plik wgrany wcześniej zostawiamy tylko wtedy, gdy frontend zwraca tę samą ścieżkę.
                if self.avatar_file and raw_avatar == self.avatar_url():
                    pass
                else:
                    if self.avatar_file:
                        self.avatar_file.delete(save=False)
                    self.avatar_image = raw_avatar[:5000]
            else:
                if self.avatar_file:
                    self.avatar_file.delete(save=False)
                self.avatar_image = ''
        if 'theme' in payload:
            self.theme = str(payload.get('theme') or 'midnight-blue')[:80]
        if isinstance(payload.get('shortcuts'), dict):
            self.shortcuts = payload['shortcuts']
        if isinstance(payload.get('preferences'), dict):
            self.preferences = payload['preferences']

    def reset_to_defaults(self):
        defaults = self.defaults_for_user(self.user)
        profile = defaults['profile']
        self.display_name = profile['displayName']
        self.avatar_text = profile['avatarText']
        self.avatar_style = profile['avatarStyle']
        self.avatar_shape = profile['avatarShape']
        if self.avatar_file:
            self.avatar_file.delete(save=False)
        self.avatar_image = profile['avatarImage']
        self.theme = defaults['theme']
        self.shortcuts = defaults['shortcuts']
        self.preferences = defaults['preferences']

    def __str__(self):
        return f'Profil ARES: {self.user.username}'


class BugReport(models.Model):
    """Zgłoszenia błędów i sugestii wysyłane przez użytkowników aplikacji."""

    STATUS_NEW = 'new'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_DONE = 'done'
    STATUS_REJECTED = 'rejected'

    STATUS_CHOICES = [
        (STATUS_NEW, 'Nowe'),
        (STATUS_IN_PROGRESS, 'W trakcie'),
        (STATUS_DONE, 'Zamknięte'),
        (STATUS_REJECTED, 'Odrzucone'),
    ]

    PRIORITY_LOW = 'low'
    PRIORITY_NORMAL = 'normal'
    PRIORITY_HIGH = 'high'
    PRIORITY_CRITICAL = 'critical'

    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Niska'),
        (PRIORITY_NORMAL, 'Normalna'),
        (PRIORITY_HIGH, 'Wysoka'),
        (PRIORITY_CRITICAL, 'Krytyczna'),
    ]

    reporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ares_bug_reports')
    title = models.CharField(max_length=180)
    description = models.TextField()
    page_url = models.URLField(max_length=500, blank=True, default='')
    browser_info = models.CharField(max_length=500, blank=True, default='')
    screenshot = models.FileField(upload_to='bug_reports/', blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_NEW)
    priority = models.CharField(max_length=30, choices=PRIORITY_CHOICES, default=PRIORITY_NORMAL)
    admin_note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'Zgłoszenie #{self.pk}: {self.title}'

    def mark_resolved_if_needed(self):
        if self.status in {self.STATUS_DONE, self.STATUS_REJECTED} and not self.resolved_at:
            self.resolved_at = timezone.now()
        if self.status not in {self.STATUS_DONE, self.STATUS_REJECTED}:
            self.resolved_at = None

