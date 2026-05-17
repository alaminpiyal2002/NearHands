from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "recipient",
        "type",
        "title",
        "is_read",
        "created_at",
    )
    list_filter = (
        "type",
        "is_read",
        "created_at",
    )
    search_fields = (
        "recipient__email",
        "recipient__username",
        "title",
        "body",
    )
    readonly_fields = (
        "created_at",
    )
    ordering = (
        "-created_at",
    )
    