from rest_framework import serializers

from accounts.models import Profile

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    provider_username = serializers.CharField(
        source="provider.username",
        read_only=True,
    )
    customer_username = serializers.CharField(
        source="customer.username",
        read_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "provider",
            "provider_username",
            "customer",
            "customer_username",
            "rating",
            "comment",
            "response",
            "is_visible",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "customer",
            "provider_username",
            "customer_username",
            "response",
            "is_visible",
            "created_at",
        ]

    def validate_provider(self, provider):
        if provider == self.context["request"].user:
            raise serializers.ValidationError("You cannot review yourself.")

        if not hasattr(provider, "profile") or provider.profile.role != Profile.Role.PROVIDER:
            raise serializers.ValidationError("You can only review provider users.")

        return provider
    
    def validate(self, attrs):
        request = self.context["request"]
        provider = attrs.get("provider")

        if Review.objects.filter(
            provider=provider,
            customer=request.user,
        ).exists():
            raise serializers.ValidationError(
                "You have already reviewed this provider."
            )

        return attrs


class ReviewResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            "response",
        ]

    def validate_response(self, response):
        if not response.strip():
            raise serializers.ValidationError("Response cannot be empty.")

        return response