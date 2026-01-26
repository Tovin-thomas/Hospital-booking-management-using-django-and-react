from django.db import models
from django.contrib.auth.models import User
from doctors.models import Doctors

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='bookings')
    p_name = models.CharField(max_length=255)
    p_phone = models.CharField(max_length=10)
    p_email = models.EmailField()
    doc_name = models.ForeignKey(Doctors, on_delete=models.CASCADE)
    booking_date = models.DateField()
    appointment_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    booked_on = models.DateField(auto_now=True)

    @property
    def formatted_date(self):
        return self.booking_date.strftime("%b %d, %Y")

    @property
    def formatted_time(self):
        if self.appointment_time:
            return self.appointment_time.strftime("%H:%M")
        return "Not Set"

    @property
    def formatted_booked_on(self):
        return self.booked_on.strftime("%b %d")

    def __str__(self):
        return f"{self.p_name} - {self.doc_name.doc_name} ({self.status})"
