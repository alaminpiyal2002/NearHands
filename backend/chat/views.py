from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Conversation, Message
from .serializers import (
    ConversationCreateSerializer,
    ConversationSerializer,
    MessageSerializer,
)


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            Conversation.objects.filter(
                Q(participant_1=user) | Q(participant_2=user)
            )
            .select_related("participant_1", "participant_2")
            .prefetch_related("messages")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action == "create":
            return ConversationCreateSerializer

        return ConversationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        conversation = serializer.save()
        output_serializer = ConversationSerializer(conversation)

        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="messages")
    def messages(self, request, pk=None):
        conversation = self.get_object()

        messages = (
            conversation.messages.select_related("sender")
            .all()
            .order_by("timestamp")
        )

        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data)


class MessageViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        user = self.request.user

        return Message.objects.filter(
            Q(conversation__participant_1=user)
            | Q(conversation__participant_2=user)
        ).select_related(
            "conversation",
            "sender",
            "conversation__participant_1",
            "conversation__participant_2",
        )

    @action(detail=True, methods=["patch"], url_path="read")
    def read(self, request, pk=None):
        message = self.get_object()

        if message.sender_id == request.user.id:
            return Response(
                {
                    "detail": "You cannot mark your own message as read."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        message.is_read = True
        message.save(update_fields=["is_read"])

        serializer = self.get_serializer(message)

        return Response(serializer.data, status=status.HTTP_200_OK)