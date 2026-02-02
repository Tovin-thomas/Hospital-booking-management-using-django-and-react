from rest_framework import permissions
from doctors.models import Doctors

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
        
        # Admin/superuser always allowed
        if request.user.is_superuser or request.user.is_staff:
            return True
        
        # Check if user is linked to a doctor profile
        return Doctors.objects.filter(user=request.user).exists()
    
    def has_object_permission(self, request, view, obj):
        # Admin/superuser always allowed
        if request.user.is_superuser or request.user.is_staff:
            return True
        
        # For bookings, check if user is the assigned doctor
        if hasattr(obj, 'doc_name'):
            doctor = Doctors.objects.filter(user=request.user).first()
            if doctor:
                return obj.doc_name.id == doctor.id
        
        return False

