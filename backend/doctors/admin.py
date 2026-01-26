from django.contrib import admin
from .models import Departments, Doctors, DoctorAvailability, DoctorLeave

class DoctorsAdmin(admin.ModelAdmin):
    list_display = ('id', 'doc_name', 'doc_spec', 'dep_name', 'user')

admin.site.register(Departments)
admin.site.register(Doctors, DoctorsAdmin)
admin.site.register(DoctorAvailability)
admin.site.register(DoctorLeave)
