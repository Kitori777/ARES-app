from django.urls import path
from .views import (
    login_view,
    register_view,
    verify_email_view,
    dashboard_view,
    logout_view,
    worksheets_view,
    worksheet_editor_view,
    import_data_view,
    history_view,
    reports_view,
    profile_view,
)

urlpatterns = [
    path('', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('verify/', verify_email_view, name='verify_email'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('worksheets/', worksheets_view, name='worksheets'),
    path('worksheets/editor/', worksheet_editor_view, name='worksheet_editor'),
    path('import-data/', import_data_view, name='import_data'),
    path('history/', history_view, name='history'),
    path('reports/', reports_view, name='reports'),
    path('profile/', profile_view, name='profile'),
    path('logout/', logout_view, name='logout'),
]
