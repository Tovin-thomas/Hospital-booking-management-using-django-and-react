import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Loads initial data from fixture file if database is empty'

    def handle(self, *args, **options):
        # Check if we already have users (skip if data exists)
        if User.objects.exists():
            self.stdout.write(self.style.SUCCESS('Database already has data. Skipping fixture load.'))
            return

        # Path to fixture file
        fixture_path = os.path.join(os.path.dirname(__file__), '..', '..', 'fixtures', 'initial_data.json')
        
        if not os.path.exists(fixture_path):
            self.stdout.write(self.style.WARNING(f'Fixture file not found at {fixture_path}. Skipping.'))
            return

        try:
            self.stdout.write('Loading initial data...')
            call_command('loaddata', fixture_path)
            self.stdout.write(self.style.SUCCESS('Initial data loaded successfully!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error loading fixture: {str(e)}'))
