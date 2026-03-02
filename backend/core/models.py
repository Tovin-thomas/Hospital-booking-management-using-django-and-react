from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


# All available admin panel sections (used as permission keys)
ADMIN_MODULES = [
    ('doctors', 'Doctors'),
    ('departments', 'Departments'),
    ('bookings', 'Bookings'),
    ('leaves', 'Doctor Leaves'),
    ('users', 'Users'),
    ('contacts', 'Messages'),
    ('admins', 'Manage Admins'),
]


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
    
    def __str__(self):
        return f"{self.name} - {self.subject}"


class AdminPermissions(models.Model):
    """
    Stores which admin panel modules a non-main superuser is allowed to access.
    The main admin (MAIN_ADMIN_USERNAME) bypasses this entirely — they can access everything.
    """
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='admin_permissions'
    )
    # Comma-separated list of allowed module keys, e.g. "doctors,bookings,leaves"
    allowed_modules = models.TextField(
        default='',
        help_text='Comma-separated list of module keys the admin can access.'
    )

    def get_modules_list(self):
        """Returns a list of allowed module key strings."""
        if not self.allowed_modules:
            return []
        return [m.strip() for m in self.allowed_modules.split(',') if m.strip()]

    def set_modules_list(self, modules):
        """Accepts a list of module key strings and saves them."""
        self.allowed_modules = ','.join(modules)

    def __str__(self):
        return f"{self.user.username} permissions: {self.allowed_modules or 'none'}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # Check if profile exists, create if it doesn't (for users created before UserProfile model)
    if hasattr(instance, 'profile'):
        try:
            instance.profile.save()
        except UserProfile.DoesNotExist:
            UserProfile.objects.create(user=instance)
    else:
        UserProfile.objects.create(user=instance)
