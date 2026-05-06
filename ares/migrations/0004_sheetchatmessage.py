# Generated manually for ARES v0.6.5

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ares', '0003_rename_ares_sheets_sheet_i_f3065f_idx_ares_sheets_sheet_i_b3a7cd_idx_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SheetChatMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('body', models.TextField(max_length=2000)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('sheet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_messages', to='ares.sheet')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sheet_chat_messages', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['created_at'],
                'indexes': [models.Index(fields=['sheet', 'created_at'], name='ares_sheetch_sheet_i_3b7b4f_idx'), models.Index(fields=['user', 'created_at'], name='ares_sheetch_user_id_425ba8_idx')],
            },
        ),
    ]
