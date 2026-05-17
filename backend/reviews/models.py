from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Review(models.Model):
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_reviews",
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="written_reviews",
    )
    rating = models.SmallIntegerField()
    comment = models.TextField(max_length=1000, blank=True)
    response = models.TextField(max_length=500, blank=True)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "customer"],
                name="unique_review_per_customer_provider",
            ),
            models.CheckConstraint(
                check=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                name="review_rating_between_1_and_5",
            ),
        ]
        indexes = [
            models.Index(fields=["provider"]),
            models.Index(fields=["customer"]),
            models.Index(fields=["is_visible"]),
        ]

    def clean(self):
        if self.provider_id == self.customer_id:
            raise ValidationError("A customer cannot review themselves.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.customer} reviewed {self.provider} ({self.rating})"