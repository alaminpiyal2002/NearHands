from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.models import Notification
from notifications.utils import create_notification

from .models import Message


@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    if not created:
        return

    recipient = instance.conversation.other_participant(instance.sender)

    create_notification(
        recipient=recipient,
        notification_type=Notification.NotificationType.MESSAGE,
        title=f"New message from {instance.sender.username}",
        body=instance.content[:300],
        link=f"/messages/{instance.conversation.id}/",
    )