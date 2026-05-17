from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for NearHands.

    We use email as the login field because the PDF requires
    email + password authentication.
    """

    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class Profile(models.Model):
    """
    Extra public and role-based user information.

    The PDF keeps role, display name, location, bio, avatar,
    rating, review count, and verification status here.
    """

    class Role(models.TextChoices):
        PROVIDER = "provider", "Provider"
        CUSTOMER = "customer", "Customer"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        db_index=True,
    )
    display_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, db_index=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.URLField(blank=True)
    average_rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0,
    )
    review_count = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["role", "location"]),
            models.Index(fields=["average_rating"]),
        ]

    def __str__(self):
        return f"{self.display_name} ({self.role})"