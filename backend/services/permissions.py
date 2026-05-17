from rest_framework import permissions


class IsProviderOrReadOnly(permissions.BasePermission):
    """
    Allow anyone to read service listings.
    Allow only providers or admins to create service listings.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_staff:
            return True

        profile = getattr(user, "profile", None)

        return profile is not None and profile.role == "provider"


class IsServiceOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Allow anyone to read a service listing.
    Allow only the service owner or admin to update/delete it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_staff:
            return True

        return obj.provider == user