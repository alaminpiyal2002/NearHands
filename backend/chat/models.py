from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Conversation(models.Model):
    participant_1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations_as_participant_1",
    )
    participant_2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations_as_participant_2",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["participant_1", "participant_2"],
                name="unique_conversation_participants",
            )
        ]
        ordering = ["-created_at"]

    def clean(self):
        if self.participant_1_id and self.participant_2_id:
            if self.participant_1_id == self.participant_2_id:
                raise ValidationError("A user cannot start a conversation with themselves.")

            if self.participant_1_id > self.participant_2_id:
                raise ValidationError(
                    "participant_1 must have the lower user ID than participant_2."
                )

    def save(self, *args, **kwargs):
        if self.participant_1_id and self.participant_2_id:
            if self.participant_1_id == self.participant_2_id:
                raise ValidationError("A user cannot start a conversation with themselves.")

            if self.participant_1_id > self.participant_2_id:
                self.participant_1_id, self.participant_2_id = (
                    self.participant_2_id,
                    self.participant_1_id,
                )

        super().save(*args, **kwargs)

    def has_participant(self, user):
        return user.is_authenticated and user.id in [
            self.participant_1_id,
            self.participant_2_id,
        ]

    def other_participant(self, user):
        if user.id == self.participant_1_id:
            return self.participant_2
        if user.id == self.participant_2_id:
            return self.participant_1
        return None

    def __str__(self):
        return f"Conversation {self.id}: {self.participant_1_id} - {self.participant_2_id}"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    content = models.TextField(max_length=2000)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["conversation", "timestamp"]),
        ]
        ordering = ["timestamp"]

    def clean(self):
        if self.conversation_id and self.sender_id:
            if not self.conversation.has_participant(self.sender):
                raise ValidationError("Sender must be a participant in the conversation.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Message {self.id} in conversation {self.conversation_id}"