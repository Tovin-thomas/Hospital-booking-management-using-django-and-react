from django.contrib import admin
from .models import Contact

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'submitted_at', 'is_read')
    list_filter = ('is_read', 'submitted_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('name', 'email', 'subject', 'message', 'submitted_at')
    date_hierarchy = 'submitted_at'
    
    def save_model(self, request, obj, form, change):
        if change:  # Only for updates
            obj.is_read = True
        super().save_model(request, obj, form, change)
