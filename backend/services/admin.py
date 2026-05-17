from django.contrib import admin

from .models import Category, Service, ServiceTag, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "parent")
    search_fields = ("name", "slug")
    list_filter = ("parent",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class ServiceTagInline(admin.TabularInline):
    model = ServiceTag
    extra = 1


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "provider",
        "category",
        "pricing_type",
        "price",
        "location",
        "is_active",
        "is_deleted",
        "view_count",
        "enquiry_count",
        "created_at",
    )
    list_filter = (
        "category",
        "pricing_type",
        "is_active",
        "is_deleted",
        "created_at",
    )
    search_fields = (
        "title",
        "description",
        "location",
        "provider__email",
        "provider__username",
    )
    readonly_fields = ("view_count", "enquiry_count", "created_at", "updated_at")
    inlines = [ServiceTagInline]