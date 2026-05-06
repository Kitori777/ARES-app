from django.urls import path
from . import views

urlpatterns = [
    path('api/sheets/', views.sheets_list, name='api_sheets_list'),
    path('api/sheets/create/', views.create_sheet, name='api_create_sheet'),
    path('api/sheets/<int:sheet_id>/', views.sheet_detail, name='api_sheet_detail'),
    path('api/sheets/<int:sheet_id>/save/', views.save_sheet, name='api_save_sheet'),
    path('api/sheets/<int:sheet_id>/delete/', views.delete_sheet, name='api_delete_sheet'),
    path('api/sheets/<int:sheet_id>/shares/', views.sheet_shares_list, name='api_sheet_shares_list'),
    path('api/sheets/<int:sheet_id>/shares/add/', views.share_sheet, name='api_share_sheet'),
    path('api/sheets/<int:sheet_id>/shares/<int:share_id>/update/', views.update_sheet_share, name='api_update_sheet_share'),
    path('api/sheets/<int:sheet_id>/shares/<int:share_id>/delete/', views.delete_sheet_share, name='api_delete_sheet_share'),
    path('api/sheets/<int:sheet_id>/chat/messages/', views.sheet_chat_messages, name='api_sheet_chat_messages'),
    path('api/sheets/<int:sheet_id>/chat/messages/add/', views.add_sheet_chat_message, name='api_add_sheet_chat_message'),
    path('api/history/', views.history_list, name='api_history_list'),
    path('api/history/add/', views.add_history_entry, name='api_add_history_entry'),
]
