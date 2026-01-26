from django.db import models
from django.contrib.auth.models import User

class Departments(models.Model):
    dep_name = models.CharField(max_length=100)
    dep_decription = models.TextField()

    def __str__(self):
        return self.dep_name

class Doctors(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    doc_name = models.CharField(max_length=255)
    doc_spec = models.CharField(max_length=255)
    dep_name = models.ForeignKey(Departments, on_delete=models.CASCADE)
    doc_image = models.ImageField(upload_to='doctors')

    def __str__(self):
        return 'Dr ' +  self.doc_name + ' - (' + self.doc_spec + ')'

    @property
    def current_status(self):
        from datetime import date
        today = date.today()
        # Check if on leave today
        if self.leaves.filter(date=today).exists():
            return "Absent"
        # Check if has availability today
        if self.availabilities.filter(day=today.weekday()).exists():
            return "Present"
        return "Not Scheduled"

class DoctorAvailability(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]
    doctor = models.ForeignKey(Doctors, on_delete=models.CASCADE, related_name='availabilities')
    day = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        verbose_name_plural = "Doctor Availabilities"

    def __str__(self):
        return f"{self.doctor.doc_name} - {self.get_day_display()} ({self.start_time} - {self.end_time})"

class DoctorLeave(models.Model):
    doctor = models.ForeignKey(Doctors, on_delete=models.CASCADE, related_name='leaves')
    date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.doctor.doc_name} - {self.date}"
