import django_filters

from .models import ServiceRequest


class ServiceRequestFilter(django_filters.FilterSet):
    min_budget = django_filters.NumberFilter(field_name="budget_min", lookup_expr="gte")
    max_budget = django_filters.NumberFilter(field_name="budget_max", lookup_expr="lte")
    deadline_before = django_filters.DateFilter(field_name="deadline", lookup_expr="lte")
    deadline_after = django_filters.DateFilter(field_name="deadline", lookup_expr="gte")

    class Meta:
        model = ServiceRequest
        fields = [
            "category",
            "status",
            "min_budget",
            "max_budget",
            "deadline_before",
            "deadline_after",
        ]