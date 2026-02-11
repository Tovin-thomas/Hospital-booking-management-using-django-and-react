from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
import os


@api_view(['POST'])
@permission_classes([AllowAny])
def setup_admin(request):
    """
    One-time admin setup endpoint.
    Requires ADMIN_SETUP_TOKEN from environment variables.
    Only works if no superuser exists.
    """
    
    # Check if setup token is configured
    setup_token = os.environ.get('ADMIN_SETUP_TOKEN')
    if not setup_token:
        return Response({
            'error': 'Admin setup is not configured on this server.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Verify the token from request
    provided_token = request.data.get('setup_token')
    if not provided_token or provided_token != setup_token:
        return Response({
            'error': 'Invalid setup token.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Check if any superuser already exists
    if User.objects.filter(is_superuser=True).exists():
        return Response({
            'error': 'Admin setup has already been completed.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get admin details from request
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    # Validate required fields
    if not all([username, email, password]):
        return Response({
            'error': 'Username, email, and password are required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return Response({
            'error': 'Username already exists.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create the superuser
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        user.is_staff = True
        user.save()
        
        return Response({
            'message': 'Admin account created successfully!',
            'username': username,
            'email': email
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Error creating admin account: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
