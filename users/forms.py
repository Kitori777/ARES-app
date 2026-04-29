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
