from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "provider",
        "customer",
        "rating",
        "is_visible",
        "created_at",
    )
    list_filter = (
        "rating",
        "is_visible",
        "created_at",
    )
    search_fields = (
        "provider__email",
        "provider__username",
        "customer__email",
        "customer__username",
        "comment",
        "response",
    )
    readonly_fields = (
        "created_at",
    )
    ordering = (
        "-created_at",
    )