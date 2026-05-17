from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode


from .models import Profile


User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "id",
            "role",
            "display_name",
            "location",
            "bio",
            "avatar",
            "average_rating",
            "review_count",
            "is_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "average_rating",
            "review_count",
            "is_verified",
            "created_at",
            "updated_at",
        ]

class PublicProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "user_id",
            "username",
            "email",
            "role",
            "display_name",
            "location",
            "bio",
            "avatar",
            "average_rating",
            "review_count",
            "is_verified",
            "created_at",
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "profile",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=Profile.Role.choices)
    display_name = serializers.CharField(max_length=100)
    location = serializers.CharField(max_length=100)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "password",
            "role",
            "display_name",
            "location",
        ]

    def validate_email(self, value):
        email = value.lower().strip()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")

        return email

    def validate_username(self, value):
        username = value.strip()

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("A user with this username already exists.")

        return username

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        role = validated_data.pop("role")
        display_name = validated_data.pop("display_name")
        location = validated_data.pop("location")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=password,
        )

        user.profile.role = role
        user.profile.display_name = display_name
        user.profile.location = location
        user.profile.save()

        return user


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get("identifier").strip()
        password = attrs.get("password")

        user = User.objects.filter(
            Q(email__iexact=identifier) | Q(username__iexact=identifier)
        ).first()

        if not user:
            raise serializers.ValidationError(
                {"identifier": "No account found with this email or username."}
            )

        authenticated_user = authenticate(
            username=user.email,
            password=password,
        )

        if not authenticated_user:
            raise serializers.ValidationError(
                {"password": "Incorrect password."}
            )

        if not authenticated_user.is_active:
            raise serializers.ValidationError(
                {"identifier": "This account is inactive."}
            )

        attrs["user"] = authenticated_user
        return attrs
    

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages))

        return value

    def validate(self, attrs):
        try:
            user_id = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError(
                {"uid": "Invalid password reset link."}
            )

        token_generator = PasswordResetTokenGenerator()

        if not token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError(
                {"token": "Invalid or expired password reset token."}
            )

        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user
