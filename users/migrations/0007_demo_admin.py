# Generated manually for ARES demo administrator account

from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_demo_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    username = 'ares_admin'
    email = 'admin@ares.local'
    password = 'Admin123!'

    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
            'password': make_password(password),
        },
    )

    changed = False

    if user.email != email:
        user.email = email
        changed = True

    if not user.is_staff:
        user.is_staff = True
        changed = True

    if not user.is_superuser:
        user.is_superuser = True
        changed = True

    if not user.is_active:
        user.is_active = True
        changed = True

    # W migracjach Django używamy historycznego modelu User,
    # dlatego nie wolno wywoływać user.set_password().
    # Historyczny model nie ma metod niestandardowych.
    user.password = make_password(password)
    changed = True

    if changed:
        user.save()


def noop_reverse(apps, schema_editor):
    # Nie usuwamy konta automatycznie przy cofnięciu migracji.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_bugreport'),
    ]

    operations = [
        migrations.RunPython(create_demo_admin, noop_reverse),
    ]
