# Generated manually for ARES bug reporting

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_rename_users_pendi_email_0df1ab_idx_users_pendi_email_2ec85b_idx_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BugReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=180)),
                ('description', models.TextField()),
                ('page_url', models.URLField(blank=True, default='', max_length=500)),
                ('browser_info', models.CharField(blank=True, default='', max_length=500)),
                ('screenshot', models.FileField(blank=True, null=True, upload_to='bug_reports/')),
                ('status', models.CharField(choices=[('new', 'Nowe'), ('in_progress', 'W trakcie'), ('done', 'Zamknięte'), ('rejected', 'Odrzucone')], default='new', max_length=30)),
                ('priority', models.CharField(choices=[('low', 'Niska'), ('normal', 'Normalna'), ('high', 'Wysoka'), ('critical', 'Krytyczna')], default='normal', max_length=30)),
                ('admin_note', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('reporter', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ares_bug_reports', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='bugreport',
            index=models.Index(fields=['status'], name='users_bugre_status_55ef24_idx'),
        ),
        migrations.AddIndex(
            model_name='bugreport',
            index=models.Index(fields=['priority'], name='users_bugre_priorit_9cc9bb_idx'),
        ),
        migrations.AddIndex(
            model_name='bugreport',
            index=models.Index(fields=['created_at'], name='users_bugre_created_5f78ab_idx'),
        ),
    ]
