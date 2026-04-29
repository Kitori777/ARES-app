import json
import logging
import random

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_POST

from .forms import RegisterForm
from .models import EmailVerification, PendingRegistration, UserProfile

logger = logging.getLogger(__name__)


def _generate_verification_code() -> str:
    return str(random.randint(100000, 999999))


def _create_verification_code(user: User) -> EmailVerification:
    EmailVerification.objects.filter(user=user).delete()
    return EmailVerification.objects.create(user=user, code=_generate_verification_code())


def _remember_verification_user(request, user: User) -> None:
    request.session['user_id_to_verify'] = user.id
    request.session['verification_email'] = user.email
    request.session.pop('pending_registration_id', None)


def _remember_pending_registration(request, pending: PendingRegistration) -> None:
    request.session['pending_registration_id'] = pending.id
    request.session['verification_email'] = pending.email
    request.session.pop('user_id_to_verify', None)


def _send_code_email(*, username: str, email: str, code: str, expires_at) -> None:
    subject = 'ARES — kod weryfikacyjny konta'
    expires_local = timezone.localtime(expires_at).strftime('%d.%m.%Y, %H:%M')
    message = (
        f'Cześć {username},\n\n'
        f'Twój kod weryfikacyjny do systemu ARES to: {code}\n\n'
        f'Kod jest ważny do: {expires_local}.\n\n'
        'Konto zostanie utworzone dopiero po poprawnym wpisaniu kodu.\n'
        'Jeżeli to nie Ty rozpoczynałeś rejestrację, zignoruj tę wiadomość.\n'
    )
    html_message = f'''
        <div style="font-family:Arial,sans-serif;line-height:1.55;color:#172033;background:#f5f7fb;padding:24px">
            <div style="max-width:560px;margin:0 auto;background:white;border-radius:18px;padding:28px;border:1px solid #e4e9f2;box-shadow:0 18px 38px rgba(22,34,51,.10)">
                <div style="font-size:13px;font-weight:800;letter-spacing:.12em;color:#4f73ff;text-transform:uppercase;margin-bottom:10px">ARES</div>
                <h2 style="margin:0 0 12px;color:#172033">Potwierdzenie rejestracji</h2>
                <p>Cześć <strong>{username}</strong>,</p>
                <p>Wpisz poniższy kod na stronie weryfikacji, aby dokończyć zakładanie konta:</p>
                <div style="font-size:32px;font-weight:900;letter-spacing:7px;padding:16px 20px;border-radius:14px;background:#eef4ff;display:inline-block;color:#1e4ed8;border:1px solid #d8e5ff">
                    {code}
                </div>
                <p style="margin-top:18px">Kod jest ważny do: <strong>{expires_local}</strong>.</p>
                <p style="color:#61708a;font-size:14px">Konto zostanie utworzone dopiero po poprawnym potwierdzeniu adresu e-mail.</p>
            </div>
        </div>
    '''
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
        html_message=html_message,
    )


def _send_verification_email(user: User, verification: EmailVerification) -> None:
    _send_code_email(
        username=user.username,
        email=user.email,
        code=verification.code,
        expires_at=verification.expires_at,
    )


def _send_pending_registration_email(pending: PendingRegistration) -> None:
    _send_code_email(
        username=pending.username,
        email=pending.email,
        code=pending.verification_code,
        expires_at=pending.expires_at,
    )


def _find_verification_user(request, email: str | None = None) -> User | None:
    """Obsługa zgodności wstecznej dla starych, nieaktywnych kont z poprzedniej wersji."""
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


def _find_pending_registration(request, email: str | None = None) -> PendingRegistration | None:
    pending_id = request.session.get('pending_registration_id')
    if pending_id:
        try:
            return PendingRegistration.objects.get(id=pending_id)
        except PendingRegistration.DoesNotExist:
            pass

    lookup_email = (email or request.session.get('verification_email') or '').strip().lower()
    if lookup_email:
        try:
            return PendingRegistration.objects.get(email__iexact=lookup_email)
        except PendingRegistration.DoesNotExist:
            return None
    return None


def _auth_page_context(**extra):
    context = {
        'auth_features': [
            'Arkusze kalkulacyjne online',
            'Raporty i historia pracy',
            'Profil użytkownika i motywy',
        ]
    }
    context.update(extra)
    return context


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

        pending = (
            PendingRegistration.objects.filter(username__iexact=username).first()
            or PendingRegistration.objects.filter(email__iexact=username).first()
        )
        if pending and check_password(password, pending.password_hash):
            _remember_pending_registration(request, pending)
            messages.warning(request, 'Rejestracja oczekuje na potwierdzenie. Wpisz kod wysłany na e-mail albo wyślij nowy kod.')
            return redirect('verify_email')

        inactive_user = User.objects.filter(username=username, is_active=False).first()
        if inactive_user and inactive_user.check_password(password):
            _remember_verification_user(request, inactive_user)
            messages.warning(request, 'Konto nie jest jeszcze aktywne. Wpisz kod wysłany na e-mail albo wyślij kod ponownie.')
            return redirect('verify_email')

        messages.error(request, 'Nieprawidłowy login lub hasło.')

    return render(request, 'login.html', _auth_page_context())


def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username'].strip()
            email = form.cleaned_data['email'].strip().lower()
            password_hash = make_password(form.cleaned_data['password1'])
            code = _generate_verification_code()

            # Stare, wygasłe próby dla tych samych danych usuwamy, aby nie blokowały rejestracji.
            PendingRegistration.objects.filter(expires_at__lt=timezone.now()).delete()

            pending = PendingRegistration(
                username=username,
                email=email,
                password_hash=password_hash,
                verification_code=code,
                expires_at=timezone.now() + timezone.timedelta(minutes=30),
                last_sent_at=timezone.now(),
            )

            try:
                pending.save()
                _send_pending_registration_email(pending)
            except Exception as exc:
                # Jeżeli SMTP nie działa, nie tworzymy właściwego konta i usuwamy próbę rejestracji.
                logger.exception('Nie udało się wysłać e-maila weryfikacyjnego do %s', email)
                if pending.pk and not settings.DEBUG:
                    pending.delete()
                elif pending.pk and settings.DEBUG:
                    _remember_pending_registration(request, pending)
                    messages.warning(request, f'Nie udało się wysłać e-maila. Tryb DEBUG — kod testowy: {pending.verification_code}')
                    return redirect('verify_email')
                messages.error(
                    request,
                    'Nie udało się wysłać e-maila weryfikacyjnego. Konto nie zostało utworzone. Sprawdź konfigurację SMTP albo spróbuj później.',
                )
            else:
                _remember_pending_registration(request, pending)
                messages.success(request, 'Kod weryfikacyjny został wysłany na Twój e-mail. Konto zostanie utworzone dopiero po potwierdzeniu kodu.')
                return redirect('verify_email')
    else:
        form = RegisterForm()

    return render(request, 'register.html', _auth_page_context(form=form))


def verify_email_view(request):
    verification_email = request.session.get('verification_email', '')

    if request.method == 'POST':
        code = request.POST.get('code', '').strip()
        email = request.POST.get('email', '').strip().lower()
        pending = _find_pending_registration(request, email=email)

        if pending:
            if pending.is_expired:
                messages.error(request, 'Kod wygasł. Wyślij nowy kod weryfikacyjny.')
                return render(request, 'verify_email.html', _auth_page_context(verification_email=pending.email))

            if pending.verification_code != code:
                messages.error(request, 'Nieprawidłowy kod weryfikacyjny.')
                return render(request, 'verify_email.html', _auth_page_context(verification_email=pending.email))

            try:
                with transaction.atomic():
                    user = User(
                        username=pending.username,
                        email=pending.email,
                        password=pending.password_hash,
                        is_active=True,
                    )
                    user.save()
                    UserProfile.objects.get_or_create(user=user)
                    pending.delete()
            except IntegrityError:
                messages.error(request, 'Nie można utworzyć konta, ponieważ login lub e-mail został już użyty.')
                return render(request, 'verify_email.html', _auth_page_context(verification_email=email or verification_email))

            request.session.pop('pending_registration_id', None)
            request.session.pop('verification_email', None)
            messages.success(request, 'Konto zostało utworzone i aktywowane. Możesz się zalogować.')
            return redirect('login')

        # Zgodność wsteczna dla starych kont utworzonych jako is_active=False.
        user = _find_verification_user(request, email=email)
        if not user:
            messages.error(request, 'Nie znaleziono oczekującej rejestracji dla podanego adresu e-mail.')
            return render(request, 'verify_email.html', _auth_page_context(verification_email=email or verification_email))

        verification = (
            EmailVerification.objects
            .filter(user=user, code=code)
            .order_by('-created_at')
            .first()
        )

        if not verification:
            messages.error(request, 'Nieprawidłowy kod weryfikacyjny.')
            return render(request, 'verify_email.html', _auth_page_context(verification_email=user.email))

        if verification.expires_at < timezone.now():
            messages.error(request, 'Kod wygasł. Wyślij nowy kod weryfikacyjny.')
            return render(request, 'verify_email.html', _auth_page_context(verification_email=user.email))

        user.is_active = True
        user.save(update_fields=['is_active'])
        UserProfile.objects.get_or_create(user=user)
        EmailVerification.objects.filter(user=user).delete()
        request.session.pop('user_id_to_verify', None)
        request.session.pop('verification_email', None)

        messages.success(request, 'Konto zostało aktywowane. Możesz się zalogować.')
        return redirect('login')

    return render(request, 'verify_email.html', _auth_page_context(verification_email=verification_email))


@require_POST
def resend_verification_email_view(request):
    email = request.POST.get('email', '').strip().lower()
    pending = _find_pending_registration(request, email=email)

    if pending:
        pending.refresh_code(_generate_verification_code())
        _remember_pending_registration(request, pending)
        try:
            _send_pending_registration_email(pending)
            messages.success(request, 'Nowy kod weryfikacyjny został wysłany na e-mail.')
        except Exception:
            logger.exception('Nie udało się ponownie wysłać e-maila weryfikacyjnego do %s', pending.email)
            if settings.DEBUG:
                messages.warning(request, f'Nie udało się wysłać e-maila. Tryb DEBUG — kod testowy: {pending.verification_code}')
            else:
                messages.error(request, 'Nie udało się wysłać e-maila. Sprawdź konfigurację SMTP albo spróbuj ponownie później.')
        return redirect('verify_email')

    # Zgodność wsteczna dla starych, nieaktywnych kont.
    user = _find_verification_user(request, email=email)
    if not user:
        messages.error(request, 'Nie znaleziono oczekującej rejestracji dla podanego adresu e-mail.')
        return redirect('verify_email')

    verification = _create_verification_code(user)
    _remember_verification_user(request, user)

    try:
        _send_verification_email(user, verification)
        messages.success(request, 'Nowy kod weryfikacyjny został wysłany na e-mail.')
    except Exception:
        logger.exception('Nie udało się ponownie wysłać e-maila weryfikacyjnego do %s', user.email)
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
