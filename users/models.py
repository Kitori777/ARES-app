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
