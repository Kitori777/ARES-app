from django.contrib import admin

from .models import HistoryEntry, Sheet, SheetShare, SheetChatMessage


@admin.register(Sheet)
class SheetAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'category', 'created_at', 'updated_at')
    list_filter = ('category', 'created_at', 'updated_at')
    search_fields = ('name', 'category', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SheetShare)
class SheetShareAdmin(admin.ModelAdmin):
    list_display = ('id', 'sheet', 'owner', 'user', 'permission', 'created_at', 'updated_at')
    list_filter = ('permission', 'created_at', 'updated_at')
    search_fields = ('sheet__name', 'owner__username', 'owner__email', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(HistoryEntry)
class HistoryEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'sheet', 'action', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('user__username', 'user__email', 'sheet__name', 'action')
    readonly_fields = ('created_at',)


@admin.register(SheetChatMessage)
class SheetChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sheet', 'user', 'body', 'created_at')
    search_fields = ('sheet__name', 'user__username', 'user__email', 'body')
    list_filter = ('created_at',)
