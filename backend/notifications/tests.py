from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Notification

from channels.layers import get_channel_layer
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase, override_settings
from rest_framework_simplejwt.tokens import RefreshToken

from core.asgi import application
from .utils import create_notification

User = get_user_model()


class NotificationAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com",
            username="notifyuser",
            password="testpass123",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            username="otheruser",
            password="testpass123",
        )

        self.notification = Notification.objects.create(
            recipient=self.user,
            type=Notification.NotificationType.SYSTEM,
            title="Test notification",
            body="This is a test notification.",
            link="/test/",
        )

        Notification.objects.create(
            recipient=self.other_user,
            type=Notification.NotificationType.SYSTEM,
            title="Other notification",
            body="This belongs to another user.",
            link="/other/",
        )

    def test_authenticated_user_can_list_own_notifications(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/v1/notifications/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Test notification")

    def test_unauthenticated_user_cannot_list_notifications(self):
        response = self.client.get("/api/v1/notifications/")

        self.assertEqual(response.status_code, 401)

    def test_user_can_mark_notification_as_read(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f"/api/v1/notifications/{self.notification.id}/read/"
        )

        self.assertEqual(response.status_code, 200)

        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)

    def test_user_can_mark_all_notifications_as_read(self):
        Notification.objects.create(
            recipient=self.user,
            type=Notification.NotificationType.MESSAGE,
            title="Second notification",
            body="Another unread notification.",
            link="/messages/1/",
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.patch("/api/v1/notifications/read-all/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["updated_count"], 2)
        self.assertFalse(
            Notification.objects.filter(recipient=self.user, is_read=False).exists()
        )

    def test_user_can_delete_own_notification(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(
            f"/api/v1/notifications/{self.notification.id}/"
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            Notification.objects.filter(id=self.notification.id).exists()
        )

    def test_user_cannot_access_other_users_notification(self):
        other_notification = Notification.objects.get(recipient=self.other_user)

        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f"/api/v1/notifications/{other_notification.id}/read/"
        )

        self.assertEqual(response.status_code, 404)


@override_settings(
    CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }
)
        
class NotificationWebSocketTests(TransactionTestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="wsuser@example.com",
            username="wsuser",
            password="testpass123",
        )

    def get_access_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    async def test_notification_websocket_connects_with_valid_jwt(self):
        token = await self.async_get_access_token(self.user)

        communicator = WebsocketCommunicator(
            application,
            f"/ws/notifications/?token={token}",
        )

        connected, _ = await communicator.connect()

        self.assertTrue(connected)

        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "connection_established")
        self.assertEqual(response["user_id"], self.user.id)

        await communicator.disconnect()

    async def test_notification_websocket_rejects_missing_token(self):
        communicator = WebsocketCommunicator(
            application,
            "/ws/notifications/",
        )

        connected, _ = await communicator.connect()

        self.assertFalse(connected)

    async def test_create_notification_saves_and_broadcasts(self):
        token = await self.async_get_access_token(self.user)

        communicator = WebsocketCommunicator(
            application,
            f"/ws/notifications/?token={token}",
        )

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.receive_json_from()

        notification = await self.async_create_notification()

        response = await communicator.receive_json_from()

        self.assertEqual(response["type"], "notification")
        self.assertEqual(response["notification"]["id"], notification.id)
        self.assertEqual(response["notification"]["title"], "Live notification")
        self.assertEqual(response["notification"]["type"], Notification.NotificationType.SYSTEM)

        await communicator.disconnect()

    async def async_get_access_token(self, user):
        from channels.db import database_sync_to_async

        return await database_sync_to_async(self.get_access_token)(user)

    async def async_create_notification(self):
        from channels.db import database_sync_to_async

        return await database_sync_to_async(create_notification)(
            recipient=self.user,
            notification_type=Notification.NotificationType.SYSTEM,
            title="Live notification",
            body="This notification was sent over WebSocket.",
            link="/notifications/",
        )