from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.utils import timezone

from .models import PendingRegistration


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True, label='Adres e-mail')

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def clean_username(self):
        username = self.cleaned_data['username'].strip()
        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError('Konto z tym loginem już istnieje.')
        if PendingRegistration.objects.filter(username__iexact=username, expires_at__gte=timezone.now()).exists():
            raise forms.ValidationError('Ten login oczekuje już na potwierdzenie e-mail. Sprawdź skrzynkę albo wyślij kod ponownie.')
        return username

    def clean_email(self):
        email = self.cleaned_data['email'].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError('Konto z tym adresem e-mail już istnieje.')
        if PendingRegistration.objects.filter(email__iexact=email, expires_at__gte=timezone.now()).exists():
            raise forms.ValidationError('Ten adres e-mail oczekuje już na potwierdzenie. Sprawdź skrzynkę albo wyślij kod ponownie.')
        return email


from .models import BugReport


class BugReportForm(forms.ModelForm):
    """Formularz zgłoszenia błędu lub sugestii przez użytkownika."""

    class Meta:
        model = BugReport
        fields = ['title', 'description', 'page_url', 'screenshot']
        labels = {
            'title': 'Tytuł zgłoszenia',
            'description': 'Opis problemu',
            'page_url': 'Adres strony / modułu',
            'screenshot': 'Zrzut ekranu',
        }
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'settings-input',
                'placeholder': 'Np. Solver nie tłumaczy się po zmianie języka',
            }),
            'description': forms.Textarea(attrs={
                'class': 'settings-input',
                'rows': 7,
                'placeholder': 'Opisz, co się stało, jakie były kroki i czego oczekiwałeś.',
            }),
            'page_url': forms.URLInput(attrs={
                'class': 'settings-input',
                'placeholder': 'Np. https://ares-1-fa2u.onrender.com/worksheets/editor/',
            }),
            'screenshot': forms.ClearableFileInput(attrs={
                'class': 'settings-input',
                'accept': 'image/png,image/jpeg,image/webp,image/gif',
            }),
        }
