from rest_framework import serializers

from .models import Category, Service, Tag


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "icon",
            "parent",
        ]
        read_only_fields = ["id", "slug"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = [
            "id",
            "name",
            "slug",
        ]
        read_only_fields = ["id", "slug"]


class ServiceSerializer(serializers.ModelSerializer):
    provider_id = serializers.IntegerField(source="provider.id", read_only=True)
    provider_name = serializers.SerializerMethodField()

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
    )

    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        source="tags",
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = Service
        fields = [
            "id",
            "provider_id",
            "provider_name",
            "title",
            "category",
            "category_id",
            "description",
            "pricing_type",
            "price",
            "location",
            "tags",
            "tag_ids",
            "is_active",
            "is_deleted",
            "view_count",
            "enquiry_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "provider_id",
            "provider_name",
            "is_deleted",
            "view_count",
            "enquiry_count",
            "created_at",
            "updated_at",
        ]

    def get_provider_name(self, obj):
        profile = getattr(obj.provider, "profile", None)

        if profile and profile.display_name:
            return profile.display_name

        return obj.provider.username or obj.provider.email

    def validate(self, attrs):
       pricing_type = attrs.get(
        "pricing_type",
        getattr(self.instance, "pricing_type", None),
       )
       price = attrs.get(
        "price",
        getattr(self.instance, "price", None),
    )

       if pricing_type in [
           Service.PricingType.FIXED,
           Service.PricingType.HOURLY,
       ] and price is None:
          raise serializers.ValidationError(
            {
                "price": "Price is required for fixed and hourly services."
            }
          )

       if price is not None and price < 0:
         raise serializers.ValidationError(
            {
                "price": "Price cannot be negative."
            }
        )

       request = self.context.get("request")

       if (
         request
         and request.method == "POST"
         and request.user
         and request.user.is_authenticated
         and not request.user.is_staff
        ):
           active_listing_count = Service.objects.filter(
               provider=request.user,
               is_active=True,
               is_deleted=False,
           ).count()

           if active_listing_count >= 20:
              raise serializers.ValidationError(
                {
                    "detail": "You can have at most 20 active service listings on the free tier."
                }
              )

       return attrs

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])

        service = Service.objects.create(**validated_data)

        if tags:
            service.tags.set(tags)

        return service

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        if tags is not None:
            instance.tags.set(tags)

        return instance