from django.contrib import admin
from django.utils.html import format_html
from .models import Departments, Doctors, DoctorAvailability, DoctorLeave

class DoctorsAdmin(admin.ModelAdmin):
    list_display = ('id', 'doc_name', 'doc_spec', 'dep_name', 'user', 'image_preview')
    list_display_links = ('id', 'doc_name')
    search_fields = ('doc_name', 'doc_spec')
    list_filter = ('dep_name', 'doc_spec')
    
    def image_preview(self, obj):
        """Display thumbnail of doctor's image in admin list"""
        if obj.doc_image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" />',
                obj.doc_image.url
            )
        return "-"
    image_preview.short_description = 'Profile Picture'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('doc_name', 'doc_spec', 'dep_name')
        }),
        ('Profile Picture', {
            'fields': ('doc_image',),
            'description': 'Upload a profile picture for the doctor'
        }),
        ('User Account', {
            'fields': ('user',),
            'description': 'Link this doctor to a user account for login access'
        }),
    )

admin.site.register(Departments)
admin.site.register(Doctors, DoctorsAdmin)
admin.site.register(DoctorAvailability)
admin.site.register(DoctorLeave)
