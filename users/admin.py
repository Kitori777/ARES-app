from django.contrib import admin
from django.utils.html import format_html

from .models import EmailVerification, PendingRegistration, UserProfile


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email', 'code')


@admin.register(PendingRegistration)
class PendingRegistrationAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'created_at', 'expires_at', 'last_sent_at')
    search_fields = ('username', 'email')
    readonly_fields = ('created_at', 'updated_at', 'last_sent_at')
    ordering = ('-created_at',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'display_name',
        'theme',
        'avatar_shape',
        'avatar_source',
        'updated_at',
    )
    search_fields = ('user__username', 'user__email', 'display_name')
    list_filter = ('theme', 'avatar_shape')
    readonly_fields = ('avatar_preview', 'updated_at')
    fieldsets = (
        ('Użytkownik', {
            'fields': ('user', 'display_name'),
        }),
        ('Awatar', {
            'fields': ('avatar_preview', 'avatar_text', 'avatar_style', 'avatar_shape', 'avatar_image', 'avatar_file'),
            'description': 'avatar_image może przechowywać zewnętrzny URL, a avatar_file lokalny plik z media/avatars/.',
        }),
        ('Wygląd', {
            'fields': ('theme',),
        }),
        ('Skróty i preferencje', {
            'fields': ('shortcuts', 'preferences'),
        }),
        ('Techniczne', {
            'fields': ('updated_at',),
        }),
    )

    @admin.display(description='Źródło awatara')
    def avatar_source(self, obj):
        if obj.avatar_file:
            return 'plik'
        if obj.avatar_image:
            return 'URL / tekst'
        return 'symbol'

    @admin.display(description='Podgląd awatara')
    def avatar_preview(self, obj):
        url = obj.avatar_url()
        if url:
            return format_html(
                '<img src="{}" style="width:72px;height:72px;border-radius:18px;object-fit:cover;border:1px solid #ddd;" />',
                url,
            )
        style = obj.avatar_style or 'linear-gradient(135deg, #6ea8ff, #3d62ff)'
        text = obj.avatar_text or 'A'
        return format_html(
            '<div style="width:72px;height:72px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-weight:800;color:white;background:{};">{}</div>',
            style,
            text,
        )
