from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification
from .serializers import NotificationSerializer


def create_notification(recipient, notification_type, title, body, link=""):
    notification = Notification.objects.create(
        recipient=recipient,
        type=notification_type,
        title=title,
        body=body,
        link=link,
    )

    channel_layer = get_channel_layer()

    if channel_layer is not None:
        async_to_sync(channel_layer.group_send)(
            f"notifications_{recipient.id}",
            {
                "type": "notification_message",
                "notification": NotificationSerializer(notification).data,
            },
        )

    return notification