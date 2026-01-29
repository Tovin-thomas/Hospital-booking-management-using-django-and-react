import os
import django
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User

try:
    count = User.objects.count()
    print(f"\n[DEBUG] Total Users in Database: {count}")
    for u in User.objects.all():
        print(f" - {u.username} (ID: {u.id}, Role: {'Admin' if u.is_superuser else 'User'})")
except Exception as e:
    print(f"\n[ERROR] {e}")
