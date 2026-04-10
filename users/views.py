import random

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.shortcuts import redirect, render

from .forms import RegisterForm


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect('dashboard')
            else:
                messages.error(request, 'Najpierw aktywuj konto kodem wysłanym na e-mail.')
        else:
            messages.error(request, 'Nieprawidłowy login lub hasło.')

    return render(request, 'login.html')


def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.email = form.cleaned_data['email']
            user.save()

            verification_code = str(random.randint(100000, 999999))

            request.session['verification_code'] = verification_code
            request.session['user_id_to_verify'] = user.id

            try:
                send_mail(
                    'Kod weryfikacyjny konta',
                    f'Twój kod weryfikacyjny to: {verification_code}',
                    None,
                    [user.email],
                    fail_silently=False,
                )
                messages.success(request, 'Kod weryfikacyjny został wysłany na Twój e-mail.')
            except Exception:
                messages.warning(
                    request,
                    f'Nie udało się wysłać e-maila. Kod testowy: {verification_code}'
                )

            return redirect('verify_email')
    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})


def verify_email_view(request):
    if request.method == 'POST':
        code = request.POST.get('code')
        session_code = request.session.get('verification_code')
        user_id = request.session.get('user_id_to_verify')

        if code and session_code and user_id and code == session_code:
            try:
                user = User.objects.get(id=user_id)
                user.is_active = True
                user.save()

                request.session.pop('verification_code', None)
                request.session.pop('user_id_to_verify', None)

                messages.success(request, 'Konto zostało aktywowane. Możesz się zalogować.')
                return redirect('login')
            except User.DoesNotExist:
                messages.error(request, 'Nie znaleziono użytkownika do aktywacji.')
        else:
            messages.error(request, 'Nieprawidłowy kod weryfikacyjny.')

    return render(request, 'verify_email.html')


@login_required
def dashboard_view(request):
    return render(request, 'app_home.html')


@login_required
def worksheets_view(request):
    return render(request, 'worksheets.html')


@login_required
def worksheet_editor_view(request):
    return render(request, 'worksheet_editor.html')


@login_required
def import_data_view(request):
    return render(request, 'import_data.html')


@login_required
def history_view(request):
    return render(request, 'history.html')


@login_required
def reports_view(request):
    return render(request, 'reports.html')


def logout_view(request):
    logout(request)
    messages.success(request, 'Zostałeś wylogowany.')
    return redirect('login')
