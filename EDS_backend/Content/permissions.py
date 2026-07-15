from rest_framework.permissions import BasePermission


class IsContentManagerOrAdmin(BasePermission):
    """Allows write access only to content_manager and admin roles."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ('content_manager', 'admin')
