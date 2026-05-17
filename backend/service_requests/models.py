from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from services.models import Category


class ServiceRequest(models.Model):
    STATUS_OPEN = "open"
    STATUS_FULFILLED = "fulfilled"
    STATUS_EXPIRED = "expired"

    STATUS_CHOICES = [
        (STATUS_OPEN, "Open"),
        (STATUS_FULFILLED, "Fulfilled"),
        (STATUS_EXPIRED, "Expired"),
    ]

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_requests",
    )
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=2000)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="service_requests",
    )
    budget_min = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    budget_max = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_OPEN,
        db_index=True,
    )
    expires_at = models.DateTimeField(blank=True)
    response_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "expires_at"]),
            models.Index(fields=["category"]),
        ]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=30)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title