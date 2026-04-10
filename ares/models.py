import json

from django.conf import settings
from django.db import models


class Sheet(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sheets'
    )
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255, blank=True, default='Bez kategorii')
    grid_data = models.TextField(default='[]')
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
