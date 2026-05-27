import json

from django.conf import settings
from django.db import models
from django.utils import timezone


class Sheet(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sheets'
    )
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255, blank=True, default='Bez kategorii')
    grid_data = models.TextField(default='[]')
    scripts_data = models.TextField(default='[]')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.name} ({self.user.username})'

    def get_grid(self):
        try:
            return json.loads(self.grid_data)
        except Exception:
            return []

    def set_grid(self, grid):
        self.grid_data = json.dumps(grid)

    def get_scripts(self):
        try:
            scripts = json.loads(self.scripts_data)
            return scripts if isinstance(scripts, list) else []
        except Exception:
            return []

    def set_scripts(self, scripts):
        self.scripts_data = json.dumps(scripts if isinstance(scripts, list) else [])


class HistoryEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='history_entries'
    )
    sheet = models.ForeignKey(
        Sheet,
        on_delete=models.CASCADE,
        related_name='history_entries',
        null=True,
        blank=True
    )
    action = models.CharField(max_length=255)
    details_data = models.TextField(default='{}')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.action}'

    def get_details(self):
        try:
            return json.loads(self.details_data)
        except Exception:
            return {}

    def set_details(self, details):
        self.details_data = json.dumps(details)



class SheetShare(models.Model):
    """Udostępnienie arkusza innemu użytkownikowi po adresie e-mail/loginie."""

    PERMISSION_VIEW = 'view'
    PERMISSION_EDIT = 'edit'

    PERMISSION_CHOICES = [
        (PERMISSION_VIEW, 'Tylko podgląd'),
        (PERMISSION_EDIT, 'Edycja'),
    ]

    sheet = models.ForeignKey(Sheet, on_delete=models.CASCADE, related_name='shares')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_sheet_shares'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shared_sheet_access'
    )
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default=PERMISSION_VIEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('sheet', 'user')
        indexes = [
            models.Index(fields=['sheet']),
            models.Index(fields=['user']),
            models.Index(fields=['permission']),
        ]

    def __str__(self):
        return f'{self.sheet.name} -> {self.user.email or self.user.username} ({self.permission})'

    @property
    def can_edit(self):
        return self.permission == self.PERMISSION_EDIT


class SheetChatMessage(models.Model):
    """Krótka wiadomość w czacie przypiętym do konkretnego arkusza."""

    sheet = models.ForeignKey(Sheet, on_delete=models.CASCADE, related_name='chat_messages')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sheet_chat_messages'
    )
    body = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['sheet', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f'{self.sheet.name} / {self.user.username}: {self.body[:40]}'


class Addon(models.Model):
    """User-submitted editor addon waiting for admin review before publication."""

    KIND_SCRIPT = 'script'
    KIND_TEMPLATE = 'template'
    KIND_TOOL = 'tool'
    KIND_MACRO = 'macro'

    KIND_CHOICES = [
        (KIND_SCRIPT, 'Skrypt'),
        (KIND_TEMPLATE, 'Szablon'),
        (KIND_TOOL, 'Narzędzie'),
        (KIND_MACRO, 'Makro'),
    ]

    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Oczekuje'),
        (STATUS_APPROVED, 'Zatwierdzony'),
        (STATUS_REJECTED, 'Odrzucony'),
    ]

    title = models.CharField(max_length=160)
    summary = models.TextField(max_length=800)
    kind = models.CharField(max_length=30, choices=KIND_CHOICES, default=KIND_SCRIPT)
    version = models.CharField(max_length=40, blank=True, default='1.0.0')
    script_body = models.TextField()
    instructions = models.TextField(blank=True, default='')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ares_addons',
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_PENDING)
    admin_note = models.TextField(blank=True, default='')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_ares_addons',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['kind']),
            models.Index(fields=['author']),
        ]

    def __str__(self):
        return f'{self.title} ({self.get_status_display()})'

    def mark_reviewed(self, *, status, reviewer, note=''):
        self.status = status
        self.reviewed_by = reviewer
        self.admin_note = note
        self.reviewed_at = timezone.now()

    def to_public_payload(self):
        author_name = ''
        if self.author_id:
            author_name = self.author.get_full_name() or self.author.username
        return {
            'id': self.id,
            'title': self.title,
            'summary': self.summary,
            'kind': self.kind,
            'kindLabel': self.get_kind_display(),
            'version': self.version,
            'author': author_name,
            'instructions': self.instructions,
            'scriptBody': self.script_body,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
        }


class FriendLink(models.Model):
    """Globalna lista znajomych użytkownika."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ares_friends_owner'
    )
    friend = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ares_friends_friend'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('owner', 'friend')
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['friend']),
        ]

    def __str__(self):
        return f'{self.owner.username} -> {self.friend.username}'


class WorkspaceGroup(models.Model):
    """Globalna grupa robocza (organizacja/projekt) z członkami i arkuszami."""

    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=190, unique=True)
    description = models.TextField(blank=True, default='')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_workspace_groups'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name', '-created_at']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.name


class WorkspaceGroupMembership(models.Model):
    ROLE_OWNER = 'owner'
    ROLE_ADMIN = 'admin'
    ROLE_MEMBER = 'member'
    ROLE_CHOICES = [
        (ROLE_OWNER, 'Owner'),
        (ROLE_ADMIN, 'Admin'),
        (ROLE_MEMBER, 'Member'),
    ]

    group = models.ForeignKey(WorkspaceGroup, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workspace_group_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_MEMBER)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['group', 'created_at']
        unique_together = ('group', 'user')
        indexes = [
            models.Index(fields=['group']),
            models.Index(fields=['user']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f'{self.group.name} / {self.user.username} ({self.role})'


class GroupSheetAssignment(models.Model):
    group = models.ForeignKey(WorkspaceGroup, on_delete=models.CASCADE, related_name='sheet_assignments')
    sheet = models.ForeignKey(Sheet, on_delete=models.CASCADE, related_name='group_assignments')
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='group_sheet_assignments')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('group', 'sheet')
        indexes = [
            models.Index(fields=['group']),
            models.Index(fields=['sheet']),
        ]

    def __str__(self):
        return f'{self.group.name} -> {self.sheet.name}'


class GroupWatch(models.Model):
    group = models.ForeignKey(WorkspaceGroup, on_delete=models.CASCADE, related_name='watchers')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_watches')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('group', 'user')
        indexes = [
            models.Index(fields=['group']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'{self.user.username} watches {self.group.name}'
