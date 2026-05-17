import django_filters

from .models import Service


class ServiceFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name="category_id")
    provider = django_filters.NumberFilter(field_name="provider_id")
    location = django_filters.CharFilter(
        field_name="location",
        lookup_expr="icontains",
    )
    min_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="gte",
    )
    max_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="lte",
    )
    pricing_type = django_filters.CharFilter(field_name="pricing_type")
    min_rating = django_filters.NumberFilter(
        field_name="provider__profile__average_rating",
        lookup_expr="gte",
    )

    class Meta:
        model = Service
        fields = [
            "category",
            "provider",
            "location",
            "min_price",
            "max_price",
            "pricing_type",
            "min_rating",
        ]