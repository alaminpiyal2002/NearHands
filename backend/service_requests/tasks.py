from django.utils import timezone

from .models import ServiceRequest

from notifications.models import Notification
from notifications.utils import create_notification


def notify_request_expired(service_request):
    return create_notification(
        recipient=service_request.customer,
        notification_type=Notification.NotificationType.EXPIRY_WARNING,
        title="Service request expired",
        body=f"Your request has expired: {service_request.title}",
        link=f"/requests/{service_request.id}/",
    )

def expire_old_service_requests():
    expired_requests = ServiceRequest.objects.filter(
        status="open",
        expires_at__lt=timezone.now(),
    )

    updated_count = 0

    for service_request in expired_requests:
        service_request.status = "expired"
        service_request.save(update_fields=["status"])
        notify_request_expired(service_request)
        updated_count += 1

    return updated_count