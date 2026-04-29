import json
import random

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_POST

from .forms import RegisterForm
from .models import EmailVerification, UserProfile


def _generate_verification_code() -> str:
    return str(random.randint(100000, 999999))


def _create_verification_code(user: User) -> EmailVerification:
    EmailVerification.objects.filter(user=user).delete()
    return EmailVerification.objects.create(user=user, code=_generate_verification_code())


def _remember_verification_user(request, user: User) -> None:
    request.session['user_id_to_verify'] = user.id
    request.session['verification_email'] = user.email


def _send_verification_email(user: User, verification: EmailVerification) -> None:
    subject = 'ARES — kod weryfikacyjny konta'
    message = (
        f'Cześć {user.username},\n\n'
        f'Twój kod weryfikacyjny do systemu ARES to: {verification.code}\n\n'
        f'Kod jest ważny do: {timezone.localtime(verification.expires_at).strftime("%d.%m.%Y, %H:%M")}.\n\n'
        'Jeżeli to nie Ty zakładałeś konto, zignoruj tę wiadomość.\n'
    )
    html_message = f'''
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#172033">
            <h2>ARES — potwierdzenie konta</h2>
            <p>Cześć <strong>{user.username}</strong>,</p>
            <p>Twój kod weryfikacyjny to:</p>
            <div style="font-size:28px;font-weight:800;letter-spacing:6px;padding:14px 18px;border-radius:12px;background:#eef4ff;display:inline-block;color:#1e4ed8">
                {verification.code}
            </div>
            <p>Kod jest ważny do: <strong>{timezone.localtime(verification.expires_at).strftime("%d.%m.%Y, %H:%M")}</strong>.</p>
            <p>Jeżeli to nie Ty zakładałeś konto, zignoruj tę wiadomość.</p>
        </div>
    '''
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
        html_message=html_message,
    )


def _find_verification_user(request, email: str | None = None) -> User | None:
    user_id = request.session.get('user_id_to_verify')
    if user_id:
        try:
            return User.objects.get(id=user_id, is_active=False)
        except User.DoesNotExist:
            pass

    lookup_email = (email or request.session.get('verification_email') or '').strip().lower()
    if lookup_email:
        try:
            return User.objects.get(email__iexact=lookup_email, is_active=False)
        except User.DoesNotExist:
            return None
    return None


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('dashboard')

        inactive_user = User.objects.filter(username=username, is_active=False).first()
        if inactive_user and inactive_user.check_password(password):
            _remember_verification_user(request, inactive_user)
            messages.warning(request, 'Konto nie jest jeszcze aktywne. Wpisz kod wysłany na e-mail albo wyślij kod ponownie.')
            return redirect('verify_email')

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
            user.email = form.cleaned_data['email'].strip().lower()
            user.save()
            UserProfile.objects.get_or_create(user=user)

            verification = _create_verification_code(user)
            _remember_verification_user(request, user)

            try:
                _send_verification_email(user, verification)
                messages.success(request, 'Kod weryfikacyjny został wysłany na Twój e-mail.')
            except Exception as exc:
                if settings.DEBUG:
                    messages.warning(request, f'Nie udało się wysłać e-maila. Kod testowy: {verification.code}')
                else:
                    messages.error(
                        request,
                        'Konto zostało utworzone, ale nie udało się wysłać e-maila. Spróbuj ponownie wysłać kod za chwilę.',
                    )
            return redirect('verify_email')
    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})


def verify_email_view(request):
    verification_email = request.session.get('verification_email', '')

    if request.method == 'POST':
        code = request.POST.get('code', '').strip()
        email = request.POST.get('email', '').strip().lower()
        user = _find_verification_user(request, email=email)

        if not user:
            messages.error(request, 'Nie znaleziono nieaktywnego konta dla podanego adresu e-mail.')
            return render(request, 'verify_email.html', {'verification_email': email or verification_email})

        verification = (
            EmailVerification.objects
            .filter(user=user, code=code)
            .order_by('-created_at')
            .first()
        )

        if not verification:
            messages.error(request, 'Nieprawidłowy kod weryfikacyjny.')
            return render(request, 'verify_email.html', {'verification_email': user.email})

        if verification.expires_at < timezone.now():
            messages.error(request, 'Kod wygasł. Wyślij nowy kod weryfikacyjny.')
            return render(request, 'verify_email.html', {'verification_email': user.email})

        user.is_active = True
        user.save(update_fields=['is_active'])
        EmailVerification.objects.filter(user=user).delete()
        request.session.pop('user_id_to_verify', None)
        request.session.pop('verification_email', None)

        messages.success(request, 'Konto zostało aktywowane. Możesz się zalogować.')
        return redirect('login')

    return render(request, 'verify_email.html', {'verification_email': verification_email})


@require_POST
def resend_verification_email_view(request):
    email = request.POST.get('email', '').strip().lower()
    user = _find_verification_user(request, email=email)

    if not user:
        messages.error(request, 'Nie znaleziono nieaktywnego konta dla podanego adresu e-mail.')
        return redirect('verify_email')

    verification = _create_verification_code(user)
    _remember_verification_user(request, user)

    try:
        _send_verification_email(user, verification)
        messages.success(request, 'Nowy kod weryfikacyjny został wysłany na e-mail.')
    except Exception:
        if settings.DEBUG:
            messages.warning(request, f'Nie udało się wysłać e-maila. Kod testowy: {verification.code}')
        else:
            messages.error(request, 'Nie udało się wysłać e-maila. Sprawdź konfigurację SMTP albo spróbuj ponownie później.')

    return redirect('verify_email')


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


@login_required
def profile_view(request):
    return render(request, 'profile.html')


@login_required
@require_http_methods(['GET', 'POST'])
def profile_settings_api(request):
    """Pobiera i zapisuje ustawienia profilu użytkownika ARES w bazie danych."""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return JsonResponse(profile.to_payload())

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': 'Nieprawidłowy JSON.'}, status=400)

    if payload.get('reset') is True:
        profile.reset_to_defaults()
    else:
        profile.apply_payload(payload)
    profile.save()

    response = profile.to_payload()
    response['ok'] = True
    return JsonResponse(response)


def logout_view(request):
    logout(request)
    messages.success(request, 'Zostałeś wylogowany.')
    return redirect('login')
