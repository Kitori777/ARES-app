from django.urls import path
from . import views

urlpatterns = [
    path('api/sheets/', views.sheets_list, name='api_sheets_list'),
    path('api/sheets/create/', views.create_sheet, name='api_create_sheet'),
    path('api/sheets/<int:sheet_id>/', views.sheet_detail, name='api_sheet_detail'),
    path('api/sheets/<int:sheet_id>/save/', views.save_sheet, name='api_save_sheet'),
    path('api/sheets/<int:sheet_id>/delete/', views.delete_sheet, name='api_delete_sheet'),
    path('api/history/', views.history_list, name='api_history_list'),
    path('api/history/add/', views.add_history_entry, name='api_add_history_entry'),
]
