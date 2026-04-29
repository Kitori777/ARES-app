# Generated manually for ARES profile avatar file persistence

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_userprofile'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='avatar_file',
            field=models.FileField(blank=True, null=True, upload_to='avatars/'),
        ),
    ]
