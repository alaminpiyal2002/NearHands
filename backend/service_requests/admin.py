from django.contrib import admin

from .models import ServiceRequest


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "customer",
        "category",
        "status",
        "budget_min",
        "budget_max",
        "deadline",
        "response_count",
        "created_at",
        "expires_at",
    )
    list_filter = ("status", "category", "created_at", "deadline")
    search_fields = (
        "title",
        "description",
        "customer__email",
        "customer__username",
    )
    readonly_fields = ("response_count", "created_at", "expires_at")
    ordering = ("-created_at",)