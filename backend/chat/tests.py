from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TransactionTestCase, override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from core.asgi import application
from .models import Conversation, Message

from django.test import override_settings

User = get_user_model()


@override_settings(
    CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }
)
class ChatModelTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email="customer@example.com",
            username="customer",
            password="StrongPass123",
        )
        self.provider = User.objects.create_user(
            email="provider@example.com",
            username="provider",
            password="StrongPass123",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="StrongPass123",
        )

    def test_conversation_orders_participants_by_id(self):
        conversation = Conversation.objects.create(
            participant_1=self.provider,
            participant_2=self.customer,
        )

        self.assertEqual(conversation.participant_1, self.customer)
        self.assertEqual(conversation.participant_2, self.provider)

    def test_conversation_cannot_be_created_with_same_user(self):
        conversation = Conversation(
            participant_1=self.customer,
            participant_2=self.customer,
        )

        with self.assertRaises(ValidationError):
            conversation.save()

    def test_message_sender_must_be_conversation_participant(self):
        conversation = Conversation.objects.create(
            participant_1=self.customer,
            participant_2=self.provider,
        )

        message = Message(
            conversation=conversation,
            sender=self.other_user,
            content="I should not be allowed.",
        )

        with self.assertRaises(ValidationError):
            message.save()




@override_settings(
    CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }
)
class ChatRestApiTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email="customer@example.com",
            username="customer",
            password="StrongPass123",
        )
        self.provider = User.objects.create_user(
            email="provider@example.com",
            username="provider",
            password="StrongPass123",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="StrongPass123",
        )

    def test_authenticated_user_can_create_conversation(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            "/api/v1/conversations/",
            {"participant_id": self.provider.id},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["participant_1_id"], self.customer.id)
        self.assertEqual(response.data["participant_2_id"], self.provider.id)

    def test_user_cannot_create_conversation_with_self(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            "/api/v1/conversations/",
            {"participant_id": self.customer.id},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_unauthenticated_user_cannot_list_conversations(self):
        response = self.client.get("/api/v1/conversations/")

        self.assertEqual(response.status_code, 401)

    def test_user_can_only_list_own_conversations(self):
        own_conversation = Conversation.objects.create(
            participant_1=self.customer,
            participant_2=self.provider,
        )
        Conversation.objects.create(
            participant_1=self.provider,
            participant_2=self.other_user,
        )

        self.client.force_authenticate(user=self.customer)

        response = self.client.get("/api/v1/conversations/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], own_conversation.id)

    def test_participant_can_get_message_history(self):
        conversation = Conversation.objects.create(
            participant_1=self.customer,
            participant_2=self.provider,
        )
        Message.objects.create(
            conversation=conversation,
            sender=self.customer,
            content="Hello provider.",
        )

        self.client.force_authenticate(user=self.provider)

        response = self.client.get(
            f"/api/v1/conversations/{conversation.id}/messages/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["content"], "Hello provider.")

    def test_non_participant_cannot_get_message_history(self):
        conversation = Conversation.objects.create(
            participant_1=self.customer,
            participant_2=self.provider,
        )

        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(
            f"/api/v1/conversations/{conversation.id}/messages/"
        )

        self.assertEqual(response.status_code, 404)

    def test_recipient_can_mark_message_as_read(self):
        conversation = Conversation.objects.create(
            participant_1=self.customer,
            participant_2=self.provider,
        )
        message = Message.objects.create(
            conversation=conversation,
            sender=self.customer,
            content="Please read this.",
        )

        self.client.force_authenticate(user=self.provider)

        response = self.client.patch(f"/api/v1/messages/{message.id}/read/")

        message.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertTrue(message.is_read)

    def test_sender_cannot_mark_own_message_as_read(self):
        conversation = Conversation.objects.create(
            participant_1=self.customer,
            participant_2=self.provider,
        )
        message = Message.objects.create(
            conversation=conversation,
            sender=self.customer,
            content="Own message.",
        )

        self.client.force_authenticate(user=self.customer)

        response = self.client.patch(f"/api/v1/messages/{message.id}/read/")

        self.assertEqual(response.status_code, 400)

    def test_message_creation_creates_recipient_notification(self):
        conversation = Conversation.objects.create(
            participant_1=self.customer,
            participant_2=self.provider,
        )

        Message.objects.create(
            conversation=conversation,
            sender=self.customer,
            content="Hello provider, are you available?",
        )

        self.assertTrue(
            self.provider.notifications.filter(
                type="message",
                title=f"New message from {self.customer.username}",
            ).exists()
        )



@override_settings(
    CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }
)
class ChatWebSocketTests(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.customer = User.objects.create_user(
            email="ws_customer@example.com",
            username="ws_customer",
            password="StrongPass123",
        )
        self.provider = User.objects.create_user(
            email="ws_provider@example.com",
            username="ws_provider",
            password="StrongPass123",
        )
        self.other_user = User.objects.create_user(
            email="ws_other@example.com",
            username="ws_other",
            password="StrongPass123",
        )
        self.conversation = Conversation.objects.create(
            participant_1=self.customer,
            participant_2=self.provider,
        )
    @database_sync_to_async
    def get_access_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    @database_sync_to_async
    def create_message(self, sender, content):
        return Message.objects.create(
          conversation=self.conversation,
          sender=sender,
          content=content,
    )

    @database_sync_to_async
    def message_is_read(self, message_id):
        return Message.objects.get(id=message_id).is_read
    
    async def test_websocket_connects_with_valid_jwt_for_participant(self):
        token = await self.get_access_token(self.customer)

        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/{self.conversation.id}/?token={token}",
        )

        connected, _ = await communicator.connect()

        self.assertTrue(connected)

        response = await communicator.receive_json_from()

        self.assertEqual(response["type"], "connection_established")
        self.assertEqual(response["user_id"], self.customer.id)
        self.assertEqual(response["conversation_id"], self.conversation.id)

        await communicator.disconnect()

    async def test_websocket_rejects_missing_token(self):
        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/{self.conversation.id}/",
        )

        connected, _ = await communicator.connect()

        self.assertFalse(connected)

    async def test_websocket_rejects_non_participant(self):
        token = self.get_access_token(self.other_user)

        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/{self.conversation.id}/?token={token}",
        )

        connected, _ = await communicator.connect()

        self.assertFalse(connected)

    async def test_websocket_persists_and_broadcasts_chat_message(self):
        customer_token = await self.get_access_token(self.customer)
        provider_token = await self.get_access_token(self.provider)

        customer_ws = WebsocketCommunicator(
            application,
            f"/ws/chat/{self.conversation.id}/?token={customer_token}",
        )
        provider_ws = WebsocketCommunicator(
            application,
            f"/ws/chat/{self.conversation.id}/?token={provider_token}",
        )

        customer_connected, _ = await customer_ws.connect()
        provider_connected, _ = await provider_ws.connect()

        self.assertTrue(customer_connected)
        self.assertTrue(provider_connected)

        await customer_ws.receive_json_from()
        await provider_ws.receive_json_from()

        await customer_ws.send_json_to(
            {
                "type": "chat_message",
                "message": "Hello from websocket test.",
            }
        )

        customer_response = await customer_ws.receive_json_from()
        provider_response = await provider_ws.receive_json_from()

        self.assertEqual(customer_response["type"], "chat_message")
        self.assertEqual(provider_response["type"], "chat_message")
        self.assertEqual(
            customer_response["content"],
            "Hello from websocket test.",
        )
        self.assertEqual(
            provider_response["content"],
            "Hello from websocket test.",
        )

        self.assertTrue(
            await self.message_exists("Hello from websocket test.")
        )

        await customer_ws.disconnect()
        await provider_ws.disconnect()

    async def test_websocket_broadcasts_typing_event(self):
        customer_token = await self.get_access_token(self.customer)
        provider_token = await self.get_access_token(self.provider)

        customer_ws = WebsocketCommunicator(
            application,
            f"/ws/chat/{self.conversation.id}/?token={customer_token}",
        )
        provider_ws = WebsocketCommunicator(
            application,
            f"/ws/chat/{self.conversation.id}/?token={provider_token}",
        )

        await customer_ws.connect()
        await provider_ws.connect()

        await customer_ws.receive_json_from()
        await provider_ws.receive_json_from()

        await customer_ws.send_json_to(
            {
                "type": "typing",
            }
        )

        customer_response = await customer_ws.receive_json_from()
        provider_response = await provider_ws.receive_json_from()

        self.assertEqual(customer_response["type"], "typing")
        self.assertEqual(provider_response["type"], "typing")
        self.assertEqual(customer_response["sender_id"], self.customer.id)
        self.assertEqual(provider_response["sender_id"], self.customer.id)

        await customer_ws.disconnect()
        await provider_ws.disconnect()

    async def test_websocket_marks_message_as_read(self):
        message = await self.create_message(
            sender=self.customer,
            content="Read me.",
        )
        provider_token = await self.get_access_token(self.provider)

        provider_ws = WebsocketCommunicator(
            application,
            f"/ws/chat/{self.conversation.id}/?token={provider_token}",
        )

        connected, _ = await provider_ws.connect()
        self.assertTrue(connected)

        await provider_ws.receive_json_from()

        await provider_ws.send_json_to(
            {
                "type": "message_read",
                "message_id": message.id,
            }
        )

        response = await provider_ws.receive_json_from()

        self.assertEqual(response["type"], "message_read")
        self.assertEqual(response["message_id"], message.id)
        self.assertEqual(response["reader_id"], self.provider.id)

        self.assertTrue(await self.message_is_read(message.id))

        await provider_ws.disconnect()

    async def message_exists(self, content):
        return await Message.objects.filter(content=content).aexists()