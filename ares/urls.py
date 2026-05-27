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
    path('api/addons/', views.approved_addons_list, name='api_approved_addons_list'),
    path('api/history/', views.history_list, name='api_history_list'),
    path('api/history/add/', views.add_history_entry, name='api_add_history_entry'),
    path('api/history/<int:entry_id>/restore/', views.restore_sheet_from_history, name='api_restore_sheet_from_history'),
    path('api/network/summary/', views.network_summary, name='api_network_summary'),
    path('api/network/friends/add/', views.add_friend, name='api_network_add_friend'),
    path('api/network/friends/<int:link_id>/remove/', views.remove_friend, name='api_network_remove_friend'),
    path('api/network/groups/create/', views.create_group, name='api_network_create_group'),
    path('api/network/groups/<int:group_id>/members/add/', views.add_group_member, name='api_network_add_group_member'),
    path('api/network/groups/<int:group_id>/members/<int:membership_id>/remove/', views.remove_group_member, name='api_network_remove_group_member'),
    path('api/network/groups/<int:group_id>/assign-sheet/', views.assign_sheet_to_group, name='api_network_assign_sheet'),
    path('api/network/groups/<int:group_id>/unassign-sheet/', views.unassign_sheet_from_group, name='api_network_unassign_sheet'),
    path('api/network/groups/<int:group_id>/watch/toggle/', views.toggle_group_watch, name='api_network_toggle_watch'),
]
