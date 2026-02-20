from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.hashers import make_password
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Prefetch, Q
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from django.utils.decorators import method_decorator
from django.conf import settings
import requests
from datetime import datetime, timedelta, date

from doctors.models import Doctors, Departments, DoctorAvailability, DoctorLeave
from bookings.models import Booking
from core.models import Contact
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    DoctorSerializer, DoctorListSerializer, DoctorCreateUpdateSerializer,
    DepartmentSerializer, DoctorAvailabilitySerializer, DoctorLeaveSerializer,
    BookingSerializer, BookingListSerializer, ContactSerializer
)
from .permissions import IsOwnerOrAdmin, IsDoctorOrAdmin


# ===========================
# User Views
# ===========================

class UserRegistrationView(generics.CreateAPIView):
    """
    Register a new user account.
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully! You can now login.'
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update the current user's profile.
    GET/PUT /api/auth/profile/
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


# ===========================
# Department Views
# ===========================

class UserViewSet(viewsets.ModelViewSet):
    """
    Manage Users (Admin only).
    """
    # only() fetches only the columns the serializer actually needs — skips password hash etc.
    queryset = User.objects.filter(
        is_superuser=False, is_staff=False
    ).only(
        'id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_active'
    ).order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    Manage departments.
    GET /api/departments/ - List (public)
    POST /api/departments/ - Create (admin)
    PUT /api/departments/{id}/ - Update (admin)
    DELETE /api/departments/{id}/ - Delete (admin)
    """
    # Annotate doctor_count in a single SQL query (no N+1 per department).
    # Django's default reverse name for the Doctors FK to Departments is 'doctors' (lowercase model name).
    queryset = Departments.objects.annotate(annotated_doctor_count=Count('doctors')).order_by('dep_name')
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['dep_name', 'dep_decription']
    ordering_fields = ['dep_name']
    ordering = ['dep_name']

    # Cache public list for 5 minutes — departments change very rarely
    @method_decorator(cache_page(60 * 5))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        """Allow public read access, but require admin for write access"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


# ===========================
# Doctor Views
# ===========================

class DoctorViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for doctors.
    GET /api/doctors/ - List all doctors (public)
    POST /api/doctors/ - Create new doctor (admin only)
    GET /api/doctors/{id}/ - Get doctor details (public)
    PUT /api/doctors/{id}/ - Update doctor (admin only)
    DELETE /api/doctors/{id}/ - Delete doctor (admin only)
    GET /api/doctors/{id}/availability/ - Get availability
    GET /api/doctors/{id}/leaves/ - Get leaves
    GET /api/doctors/{id}/available_slots/?date=YYYY-MM-DD - Get available slots
    """
    # select_related covers all FK joins in a single query.
    # prefetch_related('availabilities') is only needed for detail/availability views;
    # for the list view DoctorListSerializer no longer serializes availabilities/leaves
    # so we avoid pulling that data unnecessarily.
    queryset = Doctors.objects.all().select_related('dep_name', 'user').prefetch_related('availabilities', 'leaves')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['dep_name', 'doc_spec']
    search_fields = ['doc_name', 'doc_spec']
    ordering_fields = ['doc_name']
    ordering = ['doc_name']

    # Cache public doctor list for 5 minutes
    @method_decorator(cache_page(60 * 5))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        """Allow public read access, but require admin for create/update/delete"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DoctorCreateUpdateSerializer
        elif self.action == 'list':
            return DoctorListSerializer
        return DoctorSerializer
    

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Get doctor's availability schedule"""
        doctor = self.get_object()
        availabilities = doctor.availabilities.all().order_by('day')
        serializer = DoctorAvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def leaves(self, request, pk=None):
        """Get doctor's upcoming leave dates"""
        doctor = self.get_object()
        leaves = doctor.leaves.filter(date__gte=date.today()).order_by('date')
        serializer = DoctorLeaveSerializer(leaves, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def available_slots(self, request, pk=None):
        """
        Get available time slots for a specific date.
        Query param: ?date=YYYY-MM-DD
        """
        doctor = self.get_object()
        date_str = request.query_params.get('date')
        
        if not date_str:
            return Response(
                {'error': 'Date parameter  is required (format: YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if date is in the past
        if booking_date < date.today():
            return Response({
                'available': False,
                'reason': 'Cannot book appointments in the past',
                'slots': []
            })

        # Check if date is too far in future
        if booking_date > date.today() + timedelta(days=60):
            return Response({
                'available': False,
                'reason': 'Cannot book appointments more than 2 months in advance',
                'slots': []
            })
        
        # Check if doctor is on leave
        leave = doctor.leaves.filter(date=booking_date).first()
        if leave:
            return Response({
                'available': False,
                'reason': 'Doctor is on leave',
                'slots': []
            })
        
        # Get availability for the day
        day_of_week = booking_date.weekday()
        availability = doctor.availabilities.filter(day=day_of_week).first()
        
        if not availability:
            return Response({
                'available': False,
                'reason': f'Doctor is not scheduled on {booking_date.strftime("%A")}',
                'slots': []
            })
        
        # Generate 20-minute slots
        slots = []
        current_time = datetime.combine(booking_date, availability.start_time)
        end_time = datetime.combine(booking_date, availability.end_time)
        
        # Get all booked slots for this day
        booked_times = set(
            Booking.objects.filter(
                doc_name=doctor,
                booking_date=booking_date,
                status__in=['pending', 'accepted']
            ).values_list('appointment_time', flat=True)
        )
        
        while current_time < end_time:
            slot_time = current_time.time()
            
            # Ensure the slot fits within the shift (end time logic)
            # If 20 min slot pushes past end_time, we might exclude it depending on rules.
            # Assuming standard logic: start of slot < end_time
            
            # Only add available slots
            if slot_time not in booked_times:
                slots.append({
                    'time': slot_time.strftime('%H:%M'),
                    'available': True
                })
            
            current_time += timedelta(minutes=20)
        


        return Response({
            'available': True,
            'date': date_str,
            'day': booking_date.strftime('%A'),
            'doctor': doctor.doc_name,
            'doctor_id': doctor.id,
            'working_hours': {
                'start': availability.start_time.strftime('%H:%M'),
                'end': availability.end_time.strftime('%H:%M')
            },
            'total_slots': len(slots),
            'available_slots': len([s for s in slots if s['available']]),
            'slots': slots
        })


# ===========================
# Booking Views
# ===========================

class BookingViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for bookings.
    GET /api/bookings/ - List bookings (filtered by user role)
    POST /api/bookings/ - Create new booking
    GET /api/bookings/{id}/ - Get booking details
    PUT /api/bookings/{id}/ - Update booking
    DELETE /api/bookings/{id}/ - Delete booking
    POST /api/bookings/{id}/update_status/ - Update status (doctor/admin)
    POST /api/bookings/{id}/cancel/ - Cancel booking (owner/admin)
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'booking_date', 'doc_name']
    ordering_fields = ['booking_date', 'appointment_time', 'booked_on']
    ordering = ['-booked_on']
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin (Superuser) sees all bookings
        if user.is_superuser:
            return Booking.objects.all().select_related('doc_name', 'user')
        
        # Doctors see their bookings
        if hasattr(user, 'doctors') and user.doctors:
            return Booking.objects.filter(doc_name=user.doctors).select_related('doc_name', 'user')
        
        # Regular users see only their bookings
        return Booking.objects.filter(user=user).select_related('doc_name')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BookingListSerializer
        return BookingSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """Update booking status (for doctors/admin)"""
        booking = self.get_object()
        user = request.user
        
        # Check if user is admin
        is_admin = user.is_superuser or user.is_staff
        
        # Check if user is the doctor for this booking
        is_assigned_doctor = False
        try:
            doctor = Doctors.objects.get(user=user)
            is_assigned_doctor = booking.doc_name.id == doctor.id
        except Doctors.DoesNotExist:
            pass
        
        if not is_admin and not is_assigned_doctor:
            return Response(
                {'error': 'You can only update status for your own appointments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = dict(Booking.STATUS_CHOICES).keys()
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = new_status
        booking.save()
        
        serializer = BookingSerializer(booking, context={'request': request})
        return Response({
            'message': f'Booking status updated to {booking.get_status_display()}',
            'booking': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrAdmin])
    def cancel(self, request, pk=None):
        """Cancel a booking (for booking owner or admin)"""
        booking = self.get_object()
        
        if booking.status in ['completed', 'cancelled']:
            return Response(
                {'error': f'Cannot cancel a {booking.status} booking'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        serializer = BookingSerializer(booking, context={'request': request})
        return Response({
            'message': 'Booking cancelled successfully',
            'booking': serializer.data
        })


# ===========================
# Contact Views
# ===========================

class ContactViewSet(viewsets.ModelViewSet):
    """
    Contact message operations.
    POST /api/contacts/ - Submit contact message (anyone)
    GET /api/contacts/ - List messages (admin only)
    POST /api/contacts/{id}/mark_read/ - Mark as read (admin only)
    """
    # only() avoids loading large text blobs until actually needed
    queryset = Contact.objects.only(
        'id', 'name', 'email', 'subject', 'message', 'is_read', 'submitted_at'
    ).order_by('-submitted_at')
    serializer_class = ContactSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-submitted_at']

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'message': 'Thank you for contacting us! We will get back to you soon.',
            'contact': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def mark_read(self, request, pk=None):
        """Mark contact message as read"""
        contact = self.get_object()
        contact.is_read = True
        contact.save()
        serializer = self.get_serializer(contact)
        return Response({
            'message': 'Message marked as read',
            'contact': serializer.data
        })


# ===========================
# Dashboard Stats
# ===========================

@cache_page(60)             # Cache response for 1 minute per user
@vary_on_headers('Authorization')  # Each user gets their own cache entry (based on JWT)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics based on user role.
    GET /api/dashboard/stats/
    """
    user = request.user
    stats = {}

    if user.is_superuser:
        today = date.today()
        # Single aggregate query replaces 7 separate COUNT queries — massive DB savings
        booking_agg = Booking.objects.aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='pending')),
            accepted=Count('id', filter=Q(status='accepted')),
            today_active=Count('id', filter=Q(
                booking_date=today,
                status__in=['pending', 'accepted']
            )),
            distinct_patients=Count('user', distinct=True),
        )
        stats = {
            'role': 'admin',
            # is_main_admin is determined entirely by the server using the env variable.
            # The frontend never knows the actual username — it just gets True/False.
            'is_main_admin': (user.username == settings.MAIN_ADMIN_USERNAME),
            'total_doctors': Doctors.objects.count(),
            'total_departments': Departments.objects.count(),
            'total_bookings': booking_agg['total'],
            'pending_bookings': booking_agg['pending'],
            'accepted_bookings': booking_agg['accepted'],
            'total_patients': booking_agg['distinct_patients'],
            'unread_contacts': Contact.objects.filter(is_read=False).count(),
            'today_bookings': booking_agg['today_active'],
        }
    elif Doctors.objects.filter(user=user).exists():
        # Doctor stats
        try:
            doctor = Doctors.objects.get(user=user)
            today = date.today()
            stats = {
                'role': 'doctor',
                'doctor_name': doctor.doc_name,
                'department': doctor.dep_name.dep_name if doctor.dep_name else 'No Department',
                'total_appointments': Booking.objects.filter(doc_name=doctor).count(),
                'pending_appointments': Booking.objects.filter(doc_name=doctor, status='pending').count(),
                'accepted_appointments': Booking.objects.filter(doc_name=doctor, status='accepted').count(),
                'today_appointments': Booking.objects.filter(
                    doc_name=doctor,
                    booking_date=today,
                    status__in=['pending', 'accepted']
                ).count(),
                'upcoming_appointments': Booking.objects.filter(
                    doc_name=doctor,
                    booking_date__gt=today,
                    status__in=['pending', 'accepted']
                ).count(),
            }
        except Exception as e:
            # If there's an error loading doctor data, fall back to patient view
            stats = {
                'role': 'patient',
                'total_bookings': Booking.objects.filter(user=user).count(),
                'pending_bookings': Booking.objects.filter(user=user, status='pending').count(),
                'accepted_bookings': Booking.objects.filter(user=user, status='accepted').count(),
                'upcoming_bookings': Booking.objects.filter(
                    user=user,
                    booking_date__gte=date.today(),
                    status__in=['pending', 'accepted']
                ).count(),
                'error': f'Doctor profile error: {str(e)}'
            }
    else:
        # Patient stats
        stats = {
            'role': 'patient',
            'total_bookings': Booking.objects.filter(user=user).count(),
            'pending_bookings': Booking.objects.filter(user=user, status='pending').count(),
            'accepted_bookings': Booking.objects.filter(user=user, status='accepted').count(),
            'upcoming_bookings': Booking.objects.filter(
                user=user,
                booking_date__gte=date.today(),
                status__in=['pending', 'accepted']
            ).count(),
        }
    
    return Response(stats)


# ===========================
# Doctor Schedule Views
# ===========================

class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = DoctorAvailability.objects.all()
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return DoctorAvailability.objects.all()
        if Doctors.objects.filter(user=user).exists():
            return DoctorAvailability.objects.filter(doctor__user=user)
        return DoctorAvailability.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            doctor = Doctors.objects.get(user=user)
            serializer.save(doctor=doctor)
        except Doctors.DoesNotExist:
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        try:
            doctor = Doctors.objects.get(user=user)
            serializer.save(doctor=doctor)
        except Doctors.DoesNotExist:
            serializer.save()


class DoctorLeaveViewSet(viewsets.ModelViewSet):
    queryset = DoctorLeave.objects.all()
    serializer_class = DoctorLeaveSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return DoctorLeave.objects.all()
        if Doctors.objects.filter(user=user).exists():
            return DoctorLeave.objects.filter(doctor__user=user)
        return DoctorLeave.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        # For doctors creating their own leave
        try:
            doctor = Doctors.objects.get(user=user)
            serializer.save(doctor=doctor)
        except Doctors.DoesNotExist:
            # For admins, the doctor must be provided in the request data
            serializer.save()


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API Root - Welcome message and available endpoints.
    """
    return Response({
        'message': 'Welcome to Hospital Booking Management API',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'refresh': '/api/auth/refresh/',
                'profile': '/api/auth/profile/',
            },
            'departments': '/api/departments/',
            'doctors': '/api/doctors/',
            'bookings': '/api/bookings/',
            'contacts': '/api/contacts/',
            'dashboard': '/api/dashboard/stats/',
        },
        'documentation': 'Visit /api/ in browser mode for browsable API'
    })

# ===========================
# Google Auth View
# ===========================

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify token with Google
        try:
            # Using tokeninfo endpoint to verify ID token
            response = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={token}')
            
            if response.status_code != 200:
                return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
            
            google_data = response.json()
            email = google_data.get('email')
            
            if not email:
                return Response({'error': 'Email not found in Google token'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Create user
                username = email.split('@')[0]
                # Ensure unique username
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                # Generate random password for Google OAuth users
                from django.utils.crypto import get_random_string
                random_password = get_random_string(length=32)
                
                user = User.objects.create(
                    username=username,
                    email=email,
                    first_name=google_data.get('given_name', ''),
                    last_name=google_data.get('family_name', ''),
                    password=make_password(random_password)
                )
                # UserProfile is created by signal

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===========================
# Admin Management Views
# (Only accessible by main admin - tov)
# ===========================

class AdminListView(APIView):
    """
    GET /api/admins/ — List all superusers (admins).
    Any admin can view. Terminal-created superusers appear here automatically.
    """
    permission_classes = [IsAdminUser]

    # Cache admin list for 2 minutes — accounts change rarely.
    # vary_on_headers ensures each logged-in admin gets their own cache entry.
    @method_decorator(cache_page(60 * 2))
    @method_decorator(vary_on_headers('Authorization'))
    def get(self, request):
        # only() fetches exactly the 7 columns we need, skips password hash & other heavy fields
        admins = User.objects.filter(is_superuser=True).only(
            'id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login'
        ).order_by('date_joined')
        data = [
            {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'date_joined': u.date_joined,
                'last_login': u.last_login,
                'is_main_admin': u.username == settings.MAIN_ADMIN_USERNAME,
            }
            for u in admins
        ]
        return Response(data)


class AdminCreateView(APIView):
    """
    POST /api/admins/create/ — Promote existing user to admin OR create new admin.
    Only the main admin can do this (username set via MAIN_ADMIN_USERNAME env variable).
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        # Only the main admin can create other admins
        if request.user.username != settings.MAIN_ADMIN_USERNAME:
            return Response(
                {'error': 'Only the main administrator can create new admins.'},
                status=status.HTTP_403_FORBIDDEN
            )

        action_type = request.data.get('action_type', 'promote')  # 'promote' or 'create'

        if action_type == 'promote':
            # Promote an existing user by username
            username = request.data.get('username', '').strip()
            if not username:
                return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({'error': f'User "{username}" not found.'}, status=status.HTTP_404_NOT_FOUND)

            if user.is_superuser:
                return Response({'error': f'{username} is already an admin.'}, status=status.HTTP_400_BAD_REQUEST)

            user.is_superuser = True
            user.is_staff = True
            user.save()

            return Response({
                'message': f'{username} has been promoted to admin successfully.',
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }, status=status.HTTP_200_OK)

        elif action_type == 'create':
            # Create a completely new admin account
            username = request.data.get('username', '').strip()
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '').strip()
            first_name = request.data.get('first_name', '').strip()
            last_name = request.data.get('last_name', '').strip()

            if not username or not password:
                return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the username already exists
            existing_user = User.objects.filter(username=username).first()
            if existing_user:
                # If they are already an admin, just say so
                if existing_user.is_superuser:
                    return Response(
                        {'error': f'"{username}" is already an admin.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                # If they exist as a regular user (e.g. previously demoted admin),
                # auto-promote them instead of creating a duplicate account.
                existing_user.is_superuser = True
                existing_user.is_staff = True
                existing_user.save()
                return Response({
                    'message': f'"{username}" already had a user account and has been promoted to admin successfully.',
                    'id': existing_user.id,
                    'username': existing_user.username,
                    'email': existing_user.email,
                }, status=status.HTTP_200_OK)

            from django.contrib.auth.hashers import make_password
            user = User.objects.create(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=make_password(password),
                is_superuser=True,
                is_staff=True,
            )

            return Response({
                'message': f'Admin account "{username}" created successfully.',
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }, status=status.HTTP_201_CREATED)

        return Response({'error': 'Invalid action_type.'}, status=status.HTTP_400_BAD_REQUEST)


class AdminRemoveView(APIView):
    """
    DELETE /api/admins/{id}/remove/ — Permanently delete an admin account from the database.
    Only the main admin can do this (set via MAIN_ADMIN_USERNAME env variable).
    """
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        if request.user.username != settings.MAIN_ADMIN_USERNAME:
            return Response(
                {'error': 'Only the main administrator can delete admin accounts.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.username == settings.MAIN_ADMIN_USERNAME:
            return Response({'error': 'Cannot delete the main administrator account.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_superuser:
            return Response({'error': f'{user.username} is not an admin.'}, status=status.HTTP_400_BAD_REQUEST)

        username = user.username  # Save before deleting
        user.delete()             # Permanently remove from database

        return Response({'message': f'Admin account "{username}" has been permanently deleted.'})
