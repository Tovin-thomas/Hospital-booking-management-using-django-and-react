from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.is_staff:
            return True
        
        # Check if object has a user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsDoctorOrAdmin(permissions.BasePermission):
    """
    Custom permission for doctor or admin users.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.user.is_staff:
            return True
        
        return hasattr(request.user, 'doctors')
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        # For bookings, check if user is the assigned doctor
        if hasattr(obj, 'doc_name') and hasattr(request.user, 'doctors'):
            return obj.doc_name == request.user.doctors
        
        return False
