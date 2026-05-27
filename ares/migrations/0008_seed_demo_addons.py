from django.db import migrations
from django.utils import timezone


def seed_addons(apps, schema_editor):
    Addon = apps.get_model('ares', 'Addon')
    now = timezone.now()
    samples = [
        {
            "title": "Szybki audyt pustych komórek",
            "summary": "Zaznacza aktywny zakres i wpisuje liczbę pustych komórek do komórki obok.",
            "kind": "tool",
            "version": "1.0.0",
            "script_body": "const range = api.getSelection(); api.notify(`Zakres do audytu: ${range}`);",
            "instructions": "Zaznacz zakres, uruchom i odczytaj wynik z komunikatu.",
        },
        {
            "title": "Generator numerów zleceń",
            "summary": "Tworzy sekwencję numerów ZLEC-0001, ZLEC-0002... w zaznaczonym obszarze.",
            "kind": "macro",
            "version": "1.0.0",
            "script_body": "api.notify('Uzupełnij skrypt: generator numerów w zaznaczeniu.');",
            "instructions": "Ustaw aktywną komórkę startową i uruchom dodatek.",
        },
        {
            "title": "Podświetl duże wartości",
            "summary": "Wykrywa duże liczby i zapisuje alert do arkusza (prosty sanity-check danych).",
            "kind": "script",
            "version": "1.0.0",
            "script_body": "api.setCell('A1', 'Sprawdzone: ' + new Date().toLocaleString()); api.notify('Analiza zakończona.');",
            "instructions": "Uruchom na docelowym arkuszu, następnie sprawdź znacznik w A1.",
        },
    ]
    for row in samples:
        Addon.objects.get_or_create(
            title=row["title"],
            defaults={
                **row,
                "status": "approved",
                "reviewed_at": now,
            },
        )


def unseed_addons(apps, schema_editor):
    Addon = apps.get_model('ares', 'Addon')
    Addon.objects.filter(title__in=[
        "Szybki audyt pustych komórek",
        "Generator numerów zleceń",
        "Podświetl duże wartości",
    ]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('ares', '0007_sheet_scripts_data'),
    ]

    operations = [
        migrations.RunPython(seed_addons, unseed_addons),
    ]
