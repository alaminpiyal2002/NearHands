from django.db.models import Avg
from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.models import Notification
from notifications.utils import create_notification

from .models import Review


def update_provider_rating(provider):
    visible_reviews = Review.objects.filter(
        provider=provider,
        is_visible=True,
    )

    aggregate = visible_reviews.aggregate(
        average_rating=Avg("rating"),
    )

    average_rating = aggregate["average_rating"] or 0
    review_count = visible_reviews.count()

    provider.profile.average_rating = round(average_rating, 1)
    provider.profile.review_count = review_count
    provider.profile.save(
        update_fields=[
            "average_rating",
            "review_count",
        ]
    )


@receiver(post_save, sender=Review)
def handle_review_saved(sender, instance, created, **kwargs):
    update_provider_rating(instance.provider)

    if created:
        create_notification(
            recipient=instance.provider,
            notification_type=Notification.NotificationType.REVIEW,
            title="New review received",
            body=f"{instance.customer.username} left you a {instance.rating}-star review.",
            link=f"/profile/{instance.provider.id}/",
        )