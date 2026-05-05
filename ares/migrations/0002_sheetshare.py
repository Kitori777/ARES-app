# Generated manually for ARES sheet sharing

import django.conf
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ares', '0001_initial'),
        migrations.swappable_dependency(django.conf.settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SheetShare',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('view', 'Tylko podgląd'), ('edit', 'Edycja')], default='view', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_sheet_shares', to=django.conf.settings.AUTH_USER_MODEL)),
                ('sheet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shares', to='ares.sheet')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shared_sheet_access', to=django.conf.settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('sheet', 'user')},
            },
        ),
        migrations.AddIndex(
            model_name='sheetshare',
            index=models.Index(fields=['sheet'], name='ares_sheets_sheet_i_f3065f_idx'),
        ),
        migrations.AddIndex(
            model_name='sheetshare',
            index=models.Index(fields=['user'], name='ares_sheets_user_id_3d8cc8_idx'),
        ),
        migrations.AddIndex(
            model_name='sheetshare',
            index=models.Index(fields=['permission'], name='ares_sheets_permiss_b4107f_idx'),
        ),
    ]
