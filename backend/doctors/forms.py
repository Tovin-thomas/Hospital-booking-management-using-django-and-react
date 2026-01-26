from django import forms
from .models import DoctorAvailability, DoctorLeave

class AvailabilityForm(forms.ModelForm):
    class Meta:
        model = DoctorAvailability
        fields = ['day', 'start_time', 'end_time']
        widgets = {
            'start_time': forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}),
            'end_time': forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}),
            'day': forms.Select(attrs={'class': 'form-control'}),
        }

class LeaveForm(forms.ModelForm):
    class Meta:
        model = DoctorLeave
        fields = ['date', 'reason']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'reason': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Optional reason'}),
        }
