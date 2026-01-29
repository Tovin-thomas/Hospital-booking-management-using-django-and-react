from rest_framework import serializers
from django.contrib.auth.models import User
from doctors.models import Doctors, Departments, DoctorAvailability, DoctorLeave
from bookings.models import Booking
from core.models import Contact
from datetime import date, time, datetime, timedelta


# ===========================
# User Serializers
# ===========================

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'role', 'date_joined', 'last_login']
        read_only_fields = ['id', 'is_staff', 'is_superuser']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'admin'
        if Doctors.objects.filter(user=obj).exists():
            return 'doctor'
        return 'patient'


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'}, label='Confirm Password')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        
        # Check if username already exists
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        
        # Check if email already exists
        if attrs.get('email') and User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


# ===========================
# Department Serializers
# ===========================

class DepartmentSerializer(serializers.ModelSerializer):
    doctor_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Departments
        fields = ['id', 'dep_name', 'dep_decription', 'doctor_count']
    
    def get_doctor_count(self, obj):
        return obj.doctors_set.count()


# ===========================
# Doctor Serializers
# ===========================

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    day_display = serializers.CharField(source='get_day_display', read_only=True)
    
    class Meta:
        model = DoctorAvailability
        fields = ['id', 'day', 'day_display', 'start_time', 'end_time']


class DoctorLeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorLeave
        fields = ['id', 'date', 'reason']


class DoctorSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(source='dep_name', read_only=True)
    availabilities = DoctorAvailabilitySerializer(many=True, read_only=True)
    leaves = DoctorLeaveSerializer(many=True, read_only=True)
    current_status = serializers.ReadOnlyField()
    doc_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctors
        fields = [
            'id', 'doc_name', 'doc_spec', 'department', 
            'doc_image_url', 'current_status', 'availabilities', 'leaves'
        ]
    
    def get_doc_image_url(self, obj):
        request = self.context.get('request')
        if obj.doc_image and hasattr(obj.doc_image, 'url'):
            if request:
                return request.build_absolute_uri(obj.doc_image.url)
            return obj.doc_image.url
        return None


class DoctorListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    department_name = serializers.CharField(source='dep_name.dep_name', read_only=True)
    department_id = serializers.IntegerField(source='dep_name.id', read_only=True)
    doc_image_url = serializers.SerializerMethodField()
    current_status = serializers.ReadOnlyField()
    availabilities = DoctorAvailabilitySerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    email = serializers.EmailField(source='user.email', read_only=True, allow_null=True)
    
    class Meta:
        model = Doctors
        fields = [
            'id', 'doc_name', 'doc_spec', 'department_name', 
            'department_id', 'doc_image_url', 'current_status', 'availabilities',
            'username', 'email'
        ]
    
    def get_doc_image_url(self, obj):
        request = self.context.get('request')
        if obj.doc_image and hasattr(obj.doc_image, 'url'):
            if request:
                return request.build_absolute_uri(obj.doc_image.url)
            return obj.doc_image.url
        return None


class DoctorCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating doctors with user accounts"""
    username = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    email = serializers.EmailField(write_only=True, required=False)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Departments.objects.all(),
        source='dep_name',
        write_only=True
    )
    department_name = serializers.CharField(source='dep_name.dep_name', read_only=True)
    department_id_read = serializers.IntegerField(source='dep_name.id', read_only=True)
    current_status = serializers.ReadOnlyField()
    
    class Meta:
        model = Doctors
        fields = [
            'id', 'doc_name', 'doc_spec', 'department_id', 'department_name',
            'department_id_read', 'current_status', 'username', 'password', 'email'
        ]
        read_only_fields = ['id', 'current_status']
    
    def validate(self, attrs):
        # For creation, require user credentials
        if not self.instance:  # Creating new doctor
            if not attrs.get('username'):
                raise serializers.ValidationError({'username': 'Username is required for new doctors'})
            if not attrs.get('password'):
                raise serializers.ValidationError({'password': 'Password is required for new doctors'})
            if not attrs.get('email'):
                raise serializers.ValidationError({'email': 'Email is required for new doctors'})
            
            # Check if username exists
            if User.objects.filter(username=attrs['username']).exists():
                raise serializers.ValidationError({'username': 'This username is already taken'})
            
            # Check if email exists
            if User.objects.filter(email=attrs['email']).exists():
                raise serializers.ValidationError({'email': 'This email is already registered'})
        else:  # Updating existing doctor
            # If creating a new user account (username provided but no existing user)
            if not self.instance.user and attrs.get('username'):
                if not attrs.get('password'):
                     raise serializers.ValidationError({'password': 'Password is required when creating a new user account'})
                if not attrs.get('email'):
                     raise serializers.ValidationError({'email': 'Email is required when creating a new user account'})

            # If username is being changed, check if new username is available
            if attrs.get('username'):
                # Check if doctor has a user account
                if self.instance.user and attrs['username'] != self.instance.user.username:
                    if User.objects.filter(username=attrs['username']).exists():
                        raise serializers.ValidationError({'username': 'This username is already taken'})
                elif not self.instance.user:
                    # Creating user for doctor that doesn't have one
                    if User.objects.filter(username=attrs['username']).exists():
                        raise serializers.ValidationError({'username': 'This username is already taken'})
            
            # If email is being changed, check if new email is available
            if attrs.get('email'):
                if self.instance.user and attrs['email'] != self.instance.user.email:
                    if User.objects.filter(email=attrs['email']).exists():
                        raise serializers.ValidationError({'email': 'This email is already registered'})
                elif not self.instance.user:
                    # Creating user for doctor that doesn't have one
                    if User.objects.filter(email=attrs['email']).exists():
                        raise serializers.ValidationError({'email': 'This email is already registered'})
        
        return attrs
    
    def create(self, validated_data):
        # Extract user-related fields
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        
        # Create user account for doctor
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=True  # Doctors are staff to access their dashboard
        )
        
        # Create doctor with linked user
        doctor = Doctors.objects.create(user=user, **validated_data)
        return doctor
    
    def update(self, instance, validated_data):
        # Extract user-related fields if provided
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)
        email = validated_data.pop('email', None)
        
        # Update doctor fields
        instance.doc_name = validated_data.get('doc_name', instance.doc_name)
        instance.doc_spec = validated_data.get('doc_spec', instance.doc_spec)
        instance.dep_name = validated_data.get('dep_name', instance.dep_name)
        instance.save()
        
        # If doctor doesn't have a user account and credentials are provided, create one
        if not instance.user and username and password and email:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_staff=True
            )
            instance.user = user
            instance.save()
        # Update existing user if exists and fields provided
        elif instance.user:
            if username:
                instance.user.username = username
            if email:
                instance.user.email = email
            if password:
                instance.user.set_password(password)
            if username or email or password:
                instance.user.save()
        
        return instance


# ===========================
# Booking Serializers
# ===========================

class BookingSerializer(serializers.ModelSerializer):
    doctor = DoctorListSerializer(source='doc_name', read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctors.objects.all(),
        source='doc_name',
        write_only=True
    )
    user_name = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    formatted_date = serializers.ReadOnlyField()
    formatted_time = serializers.ReadOnlyField()
    formatted_booked_on = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'p_name', 'p_phone', 'p_email', 'doctor', 'doctor_id',
            'booking_date', 'appointment_time', 'status', 'status_display',
            'formatted_date', 'formatted_time', 'formatted_booked_on', 
            'booked_on', 'user_name'
        ]
        read_only_fields = ['id', 'user', 'booked_on', 'status']
    
    def validate(self, attrs):
        booking_date = attrs.get('booking_date')
        appointment_time = attrs.get('appointment_time')
        doctor = attrs.get('doc_name')
        
        # Check if date is in the past
        if booking_date < date.today():
            raise serializers.ValidationError({
                'booking_date': 'Cannot book appointments in the past.'
            })
        
        # Check if doctor is on leave
        if doctor.leaves.filter(date=booking_date).exists():
            leave = doctor.leaves.get(date=booking_date)
            reason_msg = f" Reason: {leave.reason}" if leave.reason else ""
            raise serializers.ValidationError({
                'booking_date': f'Doctor is on leave on this date.{reason_msg}'
            })
        
        # Check doctor availability for the day
        day_of_week = booking_date.weekday()
        availability = doctor.availabilities.filter(day=day_of_week).first()
        
        if not availability:
            raise serializers.ValidationError({
                'booking_date': f'Doctor is not available on {booking_date.strftime("%A")}s.'
            })
        
        # Check if appointment time is within working hours
        if appointment_time:
            if not (availability.start_time <= appointment_time < availability.end_time):
                raise serializers.ValidationError({
                    'appointment_time': f'Appointment time must be between {availability.start_time.strftime("%H:%M")} and {availability.end_time.strftime("%H:%M")}.'
                })
            
            # Check for conflicting appointments (20-minute slots)
            slot_start = datetime.combine(booking_date, appointment_time)
            slot_end = slot_start + timedelta(minutes=20)
            
            # Exclude current booking if updating
            conflicting_bookings = Booking.objects.filter(
                doc_name=doctor,
                booking_date=booking_date,
                status__in=['pending', 'accepted']
            )
            
            if self.instance:
                conflicting_bookings = conflicting_bookings.exclude(id=self.instance.id)
            
            for booking in conflicting_bookings:
                if booking.appointment_time:
                    existing_start = datetime.combine(booking_date, booking.appointment_time)
                    existing_end = existing_start + timedelta(minutes=20)
                    
                    if (slot_start < existing_end and slot_end > existing_start):
                        raise serializers.ValidationError({
                            'appointment_time': 'This time slot is already booked. Please choose another time.'
                        })
        
        return attrs
    
    def create(self, validated_data):
        # Automatically assign the authenticated user
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)


class BookingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for booking lists"""
    doctor_name = serializers.CharField(source='doc_name.doc_name', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    formatted_date = serializers.ReadOnlyField()
    formatted_time = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'p_name', 'user_name', 'doctor_name', 'booking_date', 'appointment_time',
            'status', 'status_display', 'formatted_date', 'formatted_time'
        ]


# ===========================
# Contact Serializers
# ===========================

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'subject', 'message', 'submitted_at', 'is_read']
        read_only_fields = ['id', 'submitted_at', 'is_read']
