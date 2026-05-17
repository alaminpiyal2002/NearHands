from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from .models import Conversation, Message

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.group_name = f"conversation_{self.conversation_id}"
        self.user = await self.get_user_from_token()

        if self.user is None:
            await self.close(code=4003)
            return

        self.conversation = await self.get_conversation()

        if self.conversation is None:
            await self.close(code=4004)
            return

        is_participant = await self.is_conversation_participant()

        if not is_participant:
            await self.close(code=4004)
            return

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()
        await self.send_json(
            {
                "type": "connection_established",
                "message": "Authenticated WebSocket connected.",
                "user_id": self.user.id,
                "conversation_id": self.conversation_id,
                "group": self.group_name,
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name,
            )

    async def receive_json(self, content, **kwargs):
        event_type = content.get("type")

        if event_type == "chat_message":
            text = content.get("message", "").strip()

            if not text:
                await self.send_json(
                    {
                        "type": "error",
                        "code": "EMPTY_MESSAGE",
                        "detail": "Message cannot be empty.",
                    }
                )
                return

            if len(text) > 2000:
                await self.send_json(
                    {
                        "type": "error",
                        "code": "MESSAGE_TOO_LONG",
                        "detail": "Message cannot exceed 2000 characters.",
                    }
                )
                return

            message = await self.create_message(text)

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "message_id": message["id"],
                    "sender_id": message["sender_id"],
                    "content": message["content"],
                    "timestamp": message["timestamp"],
                },
            )
            return
        
        if event_type == "typing":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "typing",
                    "sender_id": self.user.id,
                    "conversation_id": self.conversation_id,
                },
            )
            return

        if event_type == "message_read":
            message_id = content.get("message_id")

            if not message_id:
                await self.send_json(
                    {
                        "type": "error",
                        "code": "MESSAGE_ID_REQUIRED",
                        "detail": "message_id is required.",
                    }
                )
                return

            message = await self.mark_message_as_read(message_id)

            if message is None:
                await self.send_json(
                    {
                        "type": "error",
                        "code": "MESSAGE_NOT_FOUND",
                        "detail": "Message not found in this conversation.",
                    }
                )
                return

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "message_read",
                    "message_id": message["id"],
                    "reader_id": self.user.id,
                },
            )
            return

        await self.send_json(
            {
                "type": "error",
                "code": "UNKNOWN_EVENT",
                "detail": "Unsupported WebSocket event type.",
            }
        )

    async def chat_message(self, event):
        await self.send_json(
            {
                "type": "chat_message",
                "message_id": event["message_id"],
                "sender_id": event["sender_id"],
                "content": event["content"],
                "timestamp": event["timestamp"],
            }
        )

    async def typing(self, event):
        await self.send_json(
            {
                "type": "typing",
                "sender_id": event["sender_id"],
                "conversation_id": event["conversation_id"],
            }
        )

    async def message_read(self, event):
        await self.send_json(
            {
                "type": "message_read",
                "message_id": event["message_id"],
                "reader_id": event["reader_id"],
            }
        )

    async def get_user_from_token(self):
        query_string = self.scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if not token:
            return None

        return await self.get_user(token)

    @database_sync_to_async
    def get_user(self, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            return User.objects.get(id=user_id)
        except (TokenError, User.DoesNotExist, KeyError):
            return None

    @database_sync_to_async
    def get_conversation(self):
        try:
            return Conversation.objects.get(id=self.conversation_id)
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def is_conversation_participant(self):
        return self.conversation.has_participant(self.user)

    @database_sync_to_async
    def create_message(self, text):
        message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content=text,
        )

        return {
            "id": message.id,
            "sender_id": message.sender_id,
            "content": message.content,
            "timestamp": message.timestamp.isoformat(),
        }

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = Message.objects.get(
                id=message_id,
                conversation=self.conversation,
            )
        except Message.DoesNotExist:
            return None

        if message.sender_id == self.user.id:
            return None

        message.is_read = True
        message.save(update_fields=["is_read"])

        return {
            "id": message.id,
            "is_read": message.is_read,
        }    