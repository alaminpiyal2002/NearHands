from rest_framework import permissions


class IsCustomerOrReadOnly(permissions.BasePermission):
    """
    Read access is public.
    Write access is only for authenticated customers or admins.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        return hasattr(request.user, "profile") and request.user.profile.role == "customer"


class IsRequestOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Object updates/deletes are allowed only for the request owner or admin.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_staff:
            return True

        return obj.customer == request.user


class IsProvider(permissions.BasePermission):
    """
    Used for provider-only actions like responding to a service request.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        return hasattr(request.user, "profile") and request.user.profile.role == "provider"