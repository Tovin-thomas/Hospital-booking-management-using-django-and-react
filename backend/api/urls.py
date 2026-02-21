from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    UserRegistrationView, UserProfileView, UserViewSet,
    DepartmentViewSet, DoctorViewSet,
    BookingViewSet, ContactViewSet,
    dashboard_stats, api_root,
    DoctorAvailabilityViewSet, DoctorLeaveViewSet,
    GoogleLoginView,
    AdminListView, AdminCreateView, AdminRemoveView,
    DepartmentBlogViewSet,
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'doctor-availability', DoctorAvailabilityViewSet, basename='doctor-availability')
router.register(r'doctor-leaves', DoctorLeaveViewSet, basename='doctor-leaves')
router.register(r'users', UserViewSet, basename='user')
router.register(r'department-blogs', DepartmentBlogViewSet, basename='department-blog')

urlpatterns = [
    # API Root
    path('', api_root, name='api-root'),

    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='auth-profile'),
    path('auth/google/', GoogleLoginView.as_view(), name='auth-google'),

    # Dashboard
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),

    # Admin management (admintovin only)
    path('admins/', AdminListView.as_view(), name='admin-list'),
    path('admins/create/', AdminCreateView.as_view(), name='admin-create'),
    path('admins/<int:pk>/remove/', AdminRemoveView.as_view(), name='admin-remove'),

    # Include router URLs
    path('', include(router.urls)),
]
