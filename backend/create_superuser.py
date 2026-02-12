#!/usr/bin/env python
"""
Script to create a default superuser if one doesn't exist.
This is useful for first-time deployments.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_tutorial.settings')
django.setup()

from django.contrib.auth.models import User

def create_default_superuser():
    # Get credentials from environment variables (defaults to your specific user)
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'tov')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'tov@hospital.com')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'tovpassword123')
    
    # Check if any superuser exists
    if User.objects.filter(is_superuser=True).exists():
        print("✓ Superuser already exists. Skipping creation.")
        return
    
    # Create superuser
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✓ Superuser created successfully!")
        print(f"  Username: {username}")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        print("\n⚠️  IMPORTANT: Change this password immediately after first login!")
    except Exception as e:
        print(f"✗ Error creating superuser: {e}")

if __name__ == '__main__':
    create_default_superuser()
