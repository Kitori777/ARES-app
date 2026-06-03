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
    HOST_SHEETS = 'sheets'
    HOST_REPORTS = 'reports'
    HOST_WORKSPACE = 'workspace'

    KIND_CHOICES = [
        (KIND_SCRIPT, 'Skrypt'),
        (KIND_TEMPLATE, 'Szablon'),
        (KIND_TOOL, 'Narzędzie'),
        (KIND_MACRO, 'Makro'),
    ]

    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    HOST_CHOICES = [
        (HOST_SHEETS, 'Arkusze'),
        (HOST_REPORTS, 'Raporty'),
        (HOST_WORKSPACE, 'Workspace'),
    ]

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Oczekuje'),
        (STATUS_APPROVED, 'Zatwierdzony'),
        (STATUS_REJECTED, 'Odrzucony'),
    ]

    title = models.CharField(max_length=160)
    summary = models.TextField(max_length=800)
    kind = models.CharField(max_length=30, choices=KIND_CHOICES, default=KIND_SCRIPT)
    category = models.CharField(max_length=80, blank=True, default='Automatyzacja')
    host = models.CharField(max_length=30, choices=HOST_CHOICES, default=HOST_SHEETS)
    version = models.CharField(max_length=40, blank=True, default='1.0.0')
    script_body = models.TextField()
    instructions = models.TextField(blank=True, default='')
    entry_point = models.CharField(max_length=120, blank=True, default='onOpen')
    auth_mode = models.CharField(max_length=40, blank=True, default='user')
    scopes = models.TextField(blank=True, default='')
    menu_items = models.JSONField(default=list, blank=True)
    installation_count = models.PositiveIntegerField(default=0)
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
            'category': self.category,
            'host': self.host,
            'hostLabel': self.get_host_display(),
            'version': self.version,
            'author': author_name,
            'instructions': self.instructions,
            'scriptBody': self.script_body,
            'entryPoint': self.entry_point,
            'authMode': self.auth_mode,
            'scopes': [line.strip() for line in self.scopes.splitlines() if line.strip()],
            'menuItems': self.menu_items if isinstance(self.menu_items, list) else [],
            'installationCount': self.installation_count,
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


class WorkspaceOrganization(models.Model):
    VISIBILITY_PRIVATE = 'private'
    VISIBILITY_INTERNAL = 'internal'
    VISIBILITY_PUBLIC = 'public'
    VISIBILITY_CHOICES = [
        (VISIBILITY_PRIVATE, 'Prywatna'),
        (VISIBILITY_INTERNAL, 'WewnÄ™trzna'),
        (VISIBILITY_PUBLIC, 'Publiczna'),
    ]

    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=190, unique=True)
    description = models.TextField(blank=True, default='')
    website = models.URLField(blank=True, default='')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default=VISIBILITY_PRIVATE)
    allow_member_team_creation = models.BooleanField(default=False)
    settings_json = models.JSONField(default=dict, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_workspace_organizations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name', '-created_at']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['slug']),
            models.Index(fields=['visibility']),
        ]

    def __str__(self):
        return self.name


class WorkspaceGroup(models.Model):
    """Globalna grupa robocza (organizacja/projekt) z członkami i arkuszami."""

    VISIBILITY_VISIBLE = 'visible'
    VISIBILITY_SECRET = 'secret'
    VISIBILITY_CHOICES = [
        (VISIBILITY_VISIBLE, 'Visible'),
        (VISIBILITY_SECRET, 'Secret'),
    ]
    NOTIFY_ENABLED = 'enabled'
    NOTIFY_DISABLED = 'disabled'
    NOTIFY_CHOICES = [
        (NOTIFY_ENABLED, 'Enabled'),
        (NOTIFY_DISABLED, 'Disabled'),
    ]
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=190, unique=True)
    description = models.TextField(blank=True, default='')
    specification = models.TextField(blank=True, default='')
    organization = models.ForeignKey(
        WorkspaceOrganization,
        on_delete=models.CASCADE,
        related_name='teams',
        null=True,
        blank=True,
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        related_name='children',
        null=True,
        blank=True,
    )
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default=VISIBILITY_VISIBLE)
    notification_setting = models.CharField(max_length=20, choices=NOTIFY_CHOICES, default=NOTIFY_ENABLED)
    settings_json = models.JSONField(default=dict, blank=True)
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
            models.Index(fields=['organization']),
            models.Index(fields=['parent']),
            models.Index(fields=['visibility']),
        ]

    def __str__(self):
        return self.name


class WorkspaceGroupMembership(models.Model):
    ROLE_OWNER = 'owner'
    ROLE_ADMIN = 'admin'
    ROLE_MAINTAINER = 'maintainer'
    ROLE_MEMBER = 'member'
    ROLE_CHOICES = [
        (ROLE_OWNER, 'Owner'),
        (ROLE_ADMIN, 'Admin'),
        (ROLE_MAINTAINER, 'Maintainer'),
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


class AddonInstallation(models.Model):
    addon = models.ForeignKey(Addon, on_delete=models.CASCADE, related_name='installations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addon_installations')
    sheet = models.ForeignKey(Sheet, on_delete=models.CASCADE, related_name='addon_installations', null=True, blank=True)
    enabled = models.BooleanField(default=True)
    config_json = models.JSONField(default=dict, blank=True)
    installed_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-installed_at']
        unique_together = ('addon', 'user', 'sheet')
        indexes = [
            models.Index(fields=['addon']),
            models.Index(fields=['user']),
            models.Index(fields=['sheet']),
        ]

    def __str__(self):
        scope = self.sheet.name if self.sheet_id else 'global'
        return f'{self.user.username} -> {self.addon.title} ({scope})'


class UserReport(models.Model):
    TYPE_EXECUTIVE = 'executive'
    TYPE_ANALYTICAL = 'analytical'
    TYPE_DASHBOARD = 'dashboard'
    TYPE_NOTEBOOK = 'notebook'
    TYPE_CHOICES = [
        (TYPE_EXECUTIVE, 'Executive'),
        (TYPE_ANALYTICAL, 'Analytical'),
        (TYPE_DASHBOARD, 'Dashboard'),
        (TYPE_NOTEBOOK, 'Notebook / Quarto'),
    ]
    VISIBILITY_PRIVATE = 'private'
    VISIBILITY_TEAM = 'team'
    VISIBILITY_ORG = 'organization'
    VISIBILITY_CHOICES = [
        (VISIBILITY_PRIVATE, 'Prywatny'),
        (VISIBILITY_TEAM, 'Team'),
        (VISIBILITY_ORG, 'Organizacja'),
    ]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_reports')
    sheet = models.ForeignKey(Sheet, on_delete=models.SET_NULL, related_name='reports', null=True, blank=True)
    group = models.ForeignKey(WorkspaceGroup, on_delete=models.SET_NULL, related_name='reports', null=True, blank=True)
    organization = models.ForeignKey(WorkspaceOrganization, on_delete=models.SET_NULL, related_name='reports', null=True, blank=True)
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True, default='')
    report_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_ANALYTICAL)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default=VISIBILITY_PRIVATE)
    config_json = models.JSONField(default=dict, blank=True)
    snapshot_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['owner', 'updated_at']),
            models.Index(fields=['report_type']),
            models.Index(fields=['visibility']),
        ]

    def __str__(self):
        return f'{self.title} ({self.owner.username})'

    def to_payload(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'reportType': self.report_type,
            'reportTypeLabel': self.get_report_type_display(),
            'visibility': self.visibility,
            'visibilityLabel': self.get_visibility_display(),
            'sheetId': self.sheet_id,
            'sheetName': self.sheet.name if self.sheet_id else '',
            'groupId': self.group_id,
            'groupName': self.group.name if self.group_id else '',
            'organizationId': self.organization_id,
            'organizationName': self.organization.name if self.organization_id else '',
            'config': self.config_json if isinstance(self.config_json, dict) else {},
            'snapshot': self.snapshot_json if isinstance(self.snapshot_json, dict) else {},
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
        }
