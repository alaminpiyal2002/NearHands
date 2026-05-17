from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Conversation, Message

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source="sender.id", read_only=True)
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender_id",
            "sender_username",
            "content",
            "is_read",
            "timestamp",
        ]
        read_only_fields = [
            "id",
            "conversation",
            "sender_id",
            "sender_username",
            "is_read",
            "timestamp",
        ]


class ConversationSerializer(serializers.ModelSerializer):
    participant_1_id = serializers.IntegerField(source="participant_1.id", read_only=True)
    participant_1_username = serializers.CharField(
        source="participant_1.username",
        read_only=True,
    )
    participant_2_id = serializers.IntegerField(source="participant_2.id", read_only=True)
    participant_2_username = serializers.CharField(
        source="participant_2.username",
        read_only=True,
    )
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "participant_1_id",
            "participant_1_username",
            "participant_2_id",
            "participant_2_username",
            "last_message",
            "created_at",
        ]
        read_only_fields = fields

    def get_last_message(self, obj):
        message = obj.messages.order_by("-timestamp").first()

        if not message:
            return None

        return {
            "id": message.id,
            "sender_id": message.sender_id,
            "content": message.content,
            "is_read": message.is_read,
            "timestamp": message.timestamp,
        }


class ConversationCreateSerializer(serializers.Serializer):
    participant_id = serializers.IntegerField()

    def validate_participant_id(self, value):
        request = self.context["request"]

        if request.user.id == value:
            raise serializers.ValidationError(
                "You cannot start a conversation with yourself."
            )

        try:
            participant = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Participant does not exist.")

        self.participant = participant
        return value

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        participant = self.participant

        first_user, second_user = sorted([user, participant], key=lambda item: item.id)

        conversation, _created = Conversation.objects.get_or_create(
            participant_1=first_user,
            participant_2=second_user,
        )

        return conversation