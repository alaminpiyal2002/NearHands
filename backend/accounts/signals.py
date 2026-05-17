from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Profile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a Profile whenever a new User is created.

    Default role is customer because a role is required.
    During registration, we will update this profile with the selected role.
    """
    if created:
        Profile.objects.create(
            user=instance,
            role=Profile.Role.CUSTOMER,
            display_name=instance.username or instance.email,
            location="",
        )