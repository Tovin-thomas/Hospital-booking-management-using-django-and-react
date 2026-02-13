"""
Hospital Booking Management System - Backend API
Pure REST API server for React frontend
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root_redirect(request):
    """Redirect root URL to API documentation"""
    return JsonResponse({
        'message': 'Welcome to Hospital Booking Management API',
        'frontend': 'Please use the React app at http://localhost:5173',
        'api_docs': 'http://127.0.0.1:8000/api/',
        'admin_panel': 'http://127.0.0.1:8000/admin/',
        'endpoints': {
            'auth': '/api/auth/',
            'doctors': '/api/doctors/',
            'departments': '/api/departments/',
            'bookings': '/api/bookings/',
            'dashboard': '/api/dashboard/stats/',
        }
    })

from django.views.static import serve
import re

urlpatterns = [
    # Root - API info
    path('', api_root_redirect, name='api-root'),
    
    # Django Admin Panel
    path('admin/', admin.site.urls),
    
    # REST API (All functionality is here)
    path('api/', include('api.urls')),
    
    # Media files fallback for production (Render/Vercel)
    # Note: Cloudinary is preferred, but this allows local disk storage to work for testing
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
]
