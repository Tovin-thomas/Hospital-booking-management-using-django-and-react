from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    UserRegistrationView, UserProfileView,
    DepartmentViewSet, DoctorViewSet,
    BookingViewSet, ContactViewSet,
    dashboard_stats, api_root,
    DoctorAvailabilityViewSet, DoctorLeaveViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'doctor-availability', DoctorAvailabilityViewSet, basename='doctor-availability')
router.register(r'doctor-leaves', DoctorLeaveViewSet, basename='doctor-leaves')

urlpatterns = [
    # API Root
    path('', api_root, name='api-root'),
    
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='auth-profile'),
    
    # Dashboard
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    
    # Include router URLs (departments, doctors, bookings, contacts)
    path('', include(router.urls)),
]
