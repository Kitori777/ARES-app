from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.utils import timezone

from .models import PendingRegistration


class RegisterForm(UserCreationForm):
    username = forms.CharField(required=True, label='Login')
    email = forms.EmailField(required=True, label='Adres e-mail')
    password1 = forms.CharField(
        label='Hasło',
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        help_text='Wpisz hasło do konta ARES.',
    )
    password2 = forms.CharField(
        label='Powtórz hasło',
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        help_text='Powtórz to samo hasło dla potwierdzenia.',
    )

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


class AccountUpdateForm(forms.Form):
    """Prosta edycja podstawowych danych konta bez zmiany modelu User."""

    first_name = forms.CharField(
        required=False,
        label='Imię',
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'settings-input', 'autocomplete': 'given-name'}),
    )
    last_name = forms.CharField(
        required=False,
        label='Nazwisko',
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'settings-input', 'autocomplete': 'family-name'}),
    )
    email = forms.EmailField(
        required=True,
        label='Adres e-mail',
        widget=forms.EmailInput(attrs={'class': 'settings-input', 'autocomplete': 'email'}),
    )

    def __init__(self, *args, user=None, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean_email(self):
        email = self.cleaned_data['email'].strip().lower()
        qs = User.objects.filter(email__iexact=email)
        if self.user is not None:
            qs = qs.exclude(pk=self.user.pk)
        if qs.exists():
            raise forms.ValidationError('Ten adres e-mail jest już używany przez inne konto.')
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
