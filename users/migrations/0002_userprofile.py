# Generated manually for ARES profile settings persistence

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('display_name', models.CharField(blank=True, max_length=100)),
                ('avatar_text', models.CharField(default='A', max_length=10)),
                ('avatar_style', models.CharField(blank=True, default='linear-gradient(135deg, #6ea8ff, #3d62ff)', max_length=255)),
                ('avatar_shape', models.CharField(default='rounded', max_length=50)),
                ('avatar_image', models.TextField(blank=True, default='')),
                ('theme', models.CharField(default='midnight-blue', max_length=80)),
                ('shortcuts', models.JSONField(blank=True, default=dict)),
                ('preferences', models.JSONField(blank=True, default=dict)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='ares_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
