from users.forms import AccountUpdateForm, RegisterForm


class DummyQS:
    def __init__(self, exists_value):
        self._exists_value = exists_value

    def exists(self):
        return self._exists_value

    def exclude(self, **kwargs):
        return self


class DummyManager:
    def __init__(self, exists_value=False):
        self.exists_value = exists_value

    def filter(self, **kwargs):
        return DummyQS(self.exists_value)


def test_register_form_accepts_unique_username_email(monkeypatch):
    from users import forms as forms_module

    monkeypatch.setattr(forms_module.User, "objects", DummyManager(False))
    monkeypatch.setattr(forms_module.PendingRegistration, "objects", DummyManager(False))

    form = RegisterForm(data={
        "username": "nowy_user",
        "email": "nowy@example.com",
        "password1": "MocneHaslo123!",
        "password2": "MocneHaslo123!",
    })
    assert form.is_valid() is True


def test_register_form_rejects_duplicate_username(monkeypatch):
    from users import forms as forms_module

    class UserManagerDup(DummyManager):
        def filter(self, **kwargs):
            if "username__iexact" in kwargs:
                return DummyQS(True)
            return DummyQS(False)

    monkeypatch.setattr(forms_module.User, "objects", UserManagerDup(False))
    monkeypatch.setattr(forms_module.PendingRegistration, "objects", DummyManager(False))

    form = RegisterForm(data={
        "username": "duplikat",
        "email": "ok@example.com",
        "password1": "MocneHaslo123!",
        "password2": "MocneHaslo123!",
    })
    assert form.is_valid() is False
    assert "username" in form.errors


def test_account_update_form_rejects_email_used_by_other_user(monkeypatch):
    from users import forms as forms_module

    monkeypatch.setattr(forms_module.User, "objects", DummyManager(True))

    form = AccountUpdateForm(
        data={"first_name": "A", "last_name": "B", "email": "used@example.com"},
        user=type("U", (), {"pk": 10})(),
    )
    assert form.is_valid() is False
    assert "email" in form.errors

