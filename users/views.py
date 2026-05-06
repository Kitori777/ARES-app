import json
import logging
import random

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from django.core.exceptions import ImproperlyConfigured
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_POST

from .forms import RegisterForm, BugReportForm
from .models import EmailVerification, PendingRegistration, UserProfile, BugReport

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


def _email_backend_is_smtp() -> bool:
    return 'smtp' in str(settings.EMAIL_BACKEND).lower()


def _email_backend_is_brevo_api() -> bool:
    backend = str(getattr(settings, 'EMAIL_BACKEND', '')).lower()
    mode = str(getattr(settings, 'EMAIL_DELIVERY_MODE', '')).lower()
    return 'brevo' in backend or mode in {'brevo', 'brevo_api', 'anymail'}


def _missing_email_configuration() -> list[str]:
    """Zwraca brakujące dane poczty zanim Django spróbuje wysłać wiadomość."""
    if _email_backend_is_brevo_api():
        required = {
            'BREVO_API_KEY': getattr(settings, 'BREVO_API_KEY', ''),
            'DEFAULT_FROM_EMAIL': getattr(settings, 'DEFAULT_FROM_EMAIL', ''),
        }
        return [name for name, value in required.items() if not str(value or '').strip()]

    if not _email_backend_is_smtp():
        return []

    delivery_mode = str(getattr(settings, 'EMAIL_DELIVERY_MODE', '')).lower()
    required = {
        'EMAIL_HOST': getattr(settings, 'EMAIL_HOST', ''),
        'EMAIL_HOST_USER': getattr(settings, 'EMAIL_HOST_USER', ''),
        'EMAIL_HOST_PASSWORD': getattr(settings, 'EMAIL_HOST_PASSWORD', ''),
    }
    if delivery_mode != 'gmail':
        required['DEFAULT_FROM_EMAIL'] = getattr(settings, 'DEFAULT_FROM_EMAIL', '')

    return [name for name, value in required.items() if not str(value or '').strip()]


def _remember_emergency_code(request, code: str) -> None:
    """Kod awaryjny do testów/deploy preview, gdy SMTP jest jeszcze źle skonfigurowany."""
    if getattr(settings, 'EMAIL_VERIFICATION_CODE_ON_SCREEN', False):
        request.session['emergency_verification_code'] = code
    else:
        request.session.pop('emergency_verification_code', None)


def _clear_emergency_code(request) -> None:
    request.session.pop('emergency_verification_code', None)


def _send_code_email(*, username: str, email: str, code: str, expires_at) -> int:
    missing = _missing_email_configuration()
    if missing:
        raise ImproperlyConfigured(
            'Brakuje konfiguracji poczty: ' + ', '.join(missing)
        )

    subject = 'ARES — kod weryfikacyjny konta'
    expires_local = timezone.localtime(expires_at).strftime('%d.%m.%Y, %H:%M')
    email_context = {
        'username': username,
        'email': email,
        'code': code,
        'expires_local': expires_local,
    }
    message = render_to_string('emails/verification_code.txt', email_context)
    html_message = render_to_string('emails/verification_code.html', email_context)

    if getattr(settings, 'EMAIL_VERIFICATION_LOG_CODE', False):
        logger.info('ARES verification code for %s: %s', email, code)

    email_message = EmailMultiAlternatives(
        subject=subject,
        body=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
        headers={'X-ARES-Email-Type': 'verification-code'},
    )
    email_message.attach_alternative(html_message, 'text/html')
    sent_count = email_message.send(fail_silently=False)
    if sent_count < 1:
        raise RuntimeError('Backend pocztowy nie zwrócił potwierdzenia wysłania wiadomości.')
    return sent_count


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


def _auth_page_context(request=None, **extra):
    context = {
        'auth_features': [
            'Arkusze kalkulacyjne online',
            'Raporty i historia pracy',
            'Profil użytkownika i motywy',
        ]
    }
    if request is not None and getattr(settings, 'EMAIL_VERIFICATION_CODE_ON_SCREEN', False):
        context['emergency_verification_code'] = request.session.get('emergency_verification_code', '')
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

    return render(request, 'login.html', _auth_page_context(request))


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
                # Konto User nadal NIE powstaje. Zostawiamy tylko oczekującą rejestrację,
                # żeby po poprawieniu SMTP można było wysłać kod ponownie.
                logger.exception('Nie udało się wysłać e-maila weryfikacyjnego do %s', email)
                if pending.pk:
                    _remember_pending_registration(request, pending)
                    _remember_emergency_code(request, pending.verification_code)
                    if getattr(settings, 'EMAIL_VERIFICATION_CODE_ON_SCREEN', False):
                        messages.warning(
                            request,
                            'SMTP nie wysłał wiadomości, ale konto nie zostało utworzone. '
                            'Rejestracja czeka na potwierdzenie — użyj kodu awaryjnego widocznego poniżej albo popraw SMTP i wyślij kod ponownie.',
                        )
                        return redirect('verify_email')
                    messages.error(
                        request,
                        'Nie udało się wysłać e-maila weryfikacyjnego. Konto nie zostało utworzone. '
                        'Rejestracja czeka na potwierdzenie — popraw SMTP i kliknij „Wyślij kod ponownie”.',
                    )
                    return redirect('verify_email')
                messages.error(
                    request,
                    'Nie udało się przygotować rejestracji. Sprawdź konfigurację SMTP albo spróbuj później.',
                )
            else:
                _clear_emergency_code(request)
                _remember_pending_registration(request, pending)
                messages.success(request, 'Kod weryfikacyjny został wysłany na Twój e-mail. Konto zostanie utworzone dopiero po potwierdzeniu kodu.')
                return redirect('verify_email')
    else:
        form = RegisterForm()

    return render(request, 'register.html', _auth_page_context(request, form=form))


def verify_email_view(request):
    verification_email = request.session.get('verification_email', '')

    if request.method == 'POST':
        code = request.POST.get('code', '').strip()
        email = request.POST.get('email', '').strip().lower()
        pending = _find_pending_registration(request, email=email)

        if pending:
            if pending.is_expired:
                messages.error(request, 'Kod wygasł. Wyślij nowy kod weryfikacyjny.')
                return render(request, 'verify_email.html', _auth_page_context(request, verification_email=pending.email))

            if pending.verification_code != code:
                messages.error(request, 'Nieprawidłowy kod weryfikacyjny.')
                return render(request, 'verify_email.html', _auth_page_context(request, verification_email=pending.email))

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
                return render(request, 'verify_email.html', _auth_page_context(request, verification_email=email or verification_email))

            request.session.pop('pending_registration_id', None)
            request.session.pop('verification_email', None)
            _clear_emergency_code(request)
            messages.success(request, 'Konto zostało utworzone i aktywowane. Możesz się zalogować.')
            return redirect('login')

        # Zgodność wsteczna dla starych kont utworzonych jako is_active=False.
        user = _find_verification_user(request, email=email)
        if not user:
            messages.error(request, 'Nie znaleziono oczekującej rejestracji dla podanego adresu e-mail.')
            return render(request, 'verify_email.html', _auth_page_context(request, verification_email=email or verification_email))

        verification = (
            EmailVerification.objects
            .filter(user=user, code=code)
            .order_by('-created_at')
            .first()
        )

        if not verification:
            messages.error(request, 'Nieprawidłowy kod weryfikacyjny.')
            return render(request, 'verify_email.html', _auth_page_context(request, verification_email=user.email))

        if verification.expires_at < timezone.now():
            messages.error(request, 'Kod wygasł. Wyślij nowy kod weryfikacyjny.')
            return render(request, 'verify_email.html', _auth_page_context(request, verification_email=user.email))

        user.is_active = True
        user.save(update_fields=['is_active'])
        UserProfile.objects.get_or_create(user=user)
        EmailVerification.objects.filter(user=user).delete()
        request.session.pop('user_id_to_verify', None)
        request.session.pop('verification_email', None)
        _clear_emergency_code(request)

        messages.success(request, 'Konto zostało aktywowane. Możesz się zalogować.')
        return redirect('login')

    return render(request, 'verify_email.html', _auth_page_context(request, verification_email=verification_email))


@require_POST
def resend_verification_email_view(request):
    email = request.POST.get('email', '').strip().lower()
    pending = _find_pending_registration(request, email=email)

    if pending:
        pending.refresh_code(_generate_verification_code())
        _remember_pending_registration(request, pending)
        try:
            _send_pending_registration_email(pending)
            _clear_emergency_code(request)
            messages.success(request, 'Nowy kod weryfikacyjny został wysłany na e-mail.')
        except Exception:
            logger.exception('Nie udało się ponownie wysłać e-maila weryfikacyjnego do %s', pending.email)
            _remember_emergency_code(request, pending.verification_code)
            if getattr(settings, 'EMAIL_VERIFICATION_CODE_ON_SCREEN', False):
                messages.warning(request, 'SMTP nadal nie wysyła wiadomości. Użyj kodu awaryjnego widocznego poniżej albo popraw konfigurację SMTP.')
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
        _clear_emergency_code(request)
        messages.success(request, 'Nowy kod weryfikacyjny został wysłany na e-mail.')
    except Exception:
        logger.exception('Nie udało się ponownie wysłać e-maila weryfikacyjnego do %s', user.email)
        _remember_emergency_code(request, verification.code)
        if getattr(settings, 'EMAIL_VERIFICATION_CODE_ON_SCREEN', False):
            messages.warning(request, 'SMTP nadal nie wysyła wiadomości. Użyj kodu awaryjnego widocznego poniżej albo popraw konfigurację SMTP.')
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
def helpdesk_view(request):
    return render(request, 'helpdesk.html')


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



def is_ares_admin(user):
    return user.is_authenticated and user.is_superuser


@login_required
@require_http_methods(['GET', 'POST'])
def bug_report_view(request):
    """Formularz zgłoszenia błędu / sugestii przez użytkownika."""
    if request.method == 'POST':
        form = BugReportForm(request.POST, request.FILES)
        if form.is_valid():
            report = form.save(commit=False)
            report.reporter = request.user
            report.browser_info = request.META.get('HTTP_USER_AGENT', '')[:500]
            report.save()
            messages.success(request, 'Zgłoszenie zostało zapisane. Administrator może je teraz odczytać w panelu zgłoszeń.')
            return redirect('bug_report')
    else:
        initial = {
            'page_url': request.GET.get('page', '') or request.META.get('HTTP_REFERER', ''),
        }
        form = BugReportForm(initial=initial)

    user_reports = BugReport.objects.filter(reporter=request.user)[:20]
    return render(request, 'bug_report.html', {
        'form': form,
        'user_reports': user_reports,
    })


@login_required
@user_passes_test(is_ares_admin)
@require_http_methods(['GET', 'POST'])
def admin_bug_reports_view(request):
    """Prosty panel administracyjny do odczytu i obsługi zgłoszeń."""
    if request.method == 'POST':
        report_id = request.POST.get('report_id')
        status = request.POST.get('status')
        priority = request.POST.get('priority')
        admin_note = request.POST.get('admin_note', '')

        report = BugReport.objects.filter(id=report_id).first()
        if report:
            if status in dict(BugReport.STATUS_CHOICES):
                report.status = status
            if priority in dict(BugReport.PRIORITY_CHOICES):
                report.priority = priority
            report.admin_note = admin_note
            report.mark_resolved_if_needed()
            report.save()
            messages.success(request, f'Zaktualizowano zgłoszenie #{report.id}.')
        return redirect('admin_bug_reports')

    status_filter = request.GET.get('status', '')
    reports = BugReport.objects.select_related('reporter').all()
    if status_filter:
        reports = reports.filter(status=status_filter)

    stats = {
        'all': BugReport.objects.count(),
        'new': BugReport.objects.filter(status=BugReport.STATUS_NEW).count(),
        'in_progress': BugReport.objects.filter(status=BugReport.STATUS_IN_PROGRESS).count(),
        'done': BugReport.objects.filter(status=BugReport.STATUS_DONE).count(),
    }

    return render(request, 'admin_bug_reports.html', {
        'reports': reports[:200],
        'stats': stats,
        'status_filter': status_filter,
        'status_choices': BugReport.STATUS_CHOICES,
        'priority_choices': BugReport.PRIORITY_CHOICES,
        'demo_admin_login': 'ares_admin',
        'demo_admin_password': 'Admin123!',
    })


@login_required
@user_passes_test(is_ares_admin)
@require_http_methods(['GET', 'POST'])
def admin_users_panel_view(request):
    """Panel superadministratora do podglądu i zarządzania kontami użytkowników."""
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        action = request.POST.get('action')
        target = User.objects.filter(id=user_id).first()

        if not target:
            messages.error(request, 'Nie znaleziono użytkownika.')
            return redirect('admin_users_panel')

        if target.id == request.user.id and action in {'delete', 'deactivate', 'remove_staff', 'remove_superuser'}:
            messages.error(request, 'Nie możesz odebrać uprawnień lub usunąć konta, na którym jesteś aktualnie zalogowany.')
            return redirect('admin_users_panel')

        if action == 'activate':
            target.is_active = True
            target.save(update_fields=['is_active'])
            messages.success(request, f'Aktywowano użytkownika {target.username}.')
        elif action == 'deactivate':
            target.is_active = False
            target.save(update_fields=['is_active'])
            messages.success(request, f'Dezaktywowano użytkownika {target.username}.')
        elif action == 'make_staff':
            target.is_staff = True
            target.save(update_fields=['is_staff'])
            messages.success(request, f'Nadano uprawnienie staff użytkownikowi {target.username}.')
        elif action == 'remove_staff':
            target.is_staff = False
            target.save(update_fields=['is_staff'])
            messages.success(request, f'Odebrano uprawnienie staff użytkownikowi {target.username}.')
        elif action == 'make_superuser':
            target.is_staff = True
            target.is_superuser = True
            target.save(update_fields=['is_staff', 'is_superuser'])
            messages.success(request, f'Nadano uprawnienia superadmina użytkownikowi {target.username}.')
        elif action == 'remove_superuser':
            target.is_superuser = False
            target.save(update_fields=['is_superuser'])
            messages.success(request, f'Odebrano uprawnienia superadmina użytkownikowi {target.username}.')
        elif action == 'delete':
            username = target.username
            target.delete()
            messages.success(request, f'Usunięto użytkownika {username}.')
        else:
            messages.error(request, 'Nieznana akcja.')

        return redirect('admin_users_panel')

    query = request.GET.get('q', '').strip()
    users = User.objects.all().order_by('-is_superuser', '-is_staff', 'username')
    if query:
        users = users.filter(username__icontains=query) | User.objects.filter(email__icontains=query)

    stats = {
        'all': User.objects.count(),
        'active': User.objects.filter(is_active=True).count(),
        'staff': User.objects.filter(is_staff=True).count(),
        'superusers': User.objects.filter(is_superuser=True).count(),
    }

    return render(request, 'admin_users_panel.html', {
        'users_list': users[:300],
        'stats': stats,
        'query': query,
    })

def logout_view(request):
    logout(request)
    messages.success(request, 'Zostałeś wylogowany.')
    return redirect('login')
