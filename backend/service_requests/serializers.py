from django.utils import timezone
from rest_framework import serializers

from .models import ServiceRequest


class ServiceRequestSerializer(serializers.ModelSerializer):
    customer_id = serializers.IntegerField(source="customer.id", read_only=True)
    customer_name = serializers.CharField(source="customer.profile.display_name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "customer_id",
            "customer_name",
            "title",
            "description",
            "category",
            "category_name",
            "budget_min",
            "budget_max",
            "deadline",
            "status",
            "expires_at",
            "response_count",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "customer_id",
            "customer_name",
            "category_name",
            "expires_at",
            "response_count",
            "created_at",
        ]

    def validate(self, attrs):
        budget_min = attrs.get("budget_min")
        budget_max = attrs.get("budget_max")
        deadline = attrs.get("deadline")
        new_status = attrs.get("status")

        if self.instance:
            budget_min = budget_min if budget_min is not None else self.instance.budget_min
            budget_max = budget_max if budget_max is not None else self.instance.budget_max

        if budget_min is not None and budget_max is not None:
            if budget_max < budget_min:
                raise serializers.ValidationError({
                    "budget_max": "Budget maximum must be greater than or equal to budget minimum."
                })

        if deadline is not None and deadline <= timezone.localdate():
            raise serializers.ValidationError({
                "deadline": "Deadline must be a future date."
            })

        if self.instance and new_status is not None:
            current_status = self.instance.status

            if current_status != ServiceRequest.STATUS_OPEN:
                raise serializers.ValidationError({
                    "status": "Only open service requests can change status."
                })

            allowed_statuses = [
                ServiceRequest.STATUS_OPEN,
                ServiceRequest.STATUS_FULFILLED,
            ]

            if new_status not in allowed_statuses:
                raise serializers.ValidationError({
                    "status": "Customers can only keep a request open or mark it fulfilled."
                })

        return attrs