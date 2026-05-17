from django.contrib import admin

from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ("sender", "content", "is_read", "timestamp")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "participant_1",
        "participant_2",
        "created_at",
    )
    list_filter = ("created_at",)
    search_fields = (
        "participant_1__username",
        "participant_1__email",
        "participant_2__username",
        "participant_2__email",
    )
    readonly_fields = ("created_at",)
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "sender",
        "is_read",
        "timestamp",
    )
    list_filter = (
        "is_read",
        "timestamp",
    )
    search_fields = (
        "content",
        "sender__username",
        "sender__email",
        "conversation__participant_1__username",
        "conversation__participant_2__username",
    )
    readonly_fields = ("timestamp",)
    ordering = ("-timestamp",)