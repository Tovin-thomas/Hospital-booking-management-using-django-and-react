from django import forms
from .models import Booking
from doctors.models import DoctorAvailability, DoctorLeave
import datetime

class DateInput(forms.DateInput):
    input_type = 'date'

class TimeInput(forms.TimeInput):
    input_type = 'time'
    
    def __init__(self, attrs=None):
        default_attrs = {'step': '900'}  # 900 seconds = 15 minutes
        if attrs:
            default_attrs.update(attrs)
        super().__init__(attrs=default_attrs)

class BookingForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = ['p_name', 'p_phone', 'p_email', 'doc_name', 'booking_date', 'appointment_time']
        widgets = {
            'booking_date': DateInput(attrs={'class': 'form-control'}),
            'appointment_time': TimeInput(attrs={'class': 'form-control'}),
            'p_name': forms.TextInput(attrs={'class': 'form-control'}),
            'p_phone': forms.TextInput(attrs={'class': 'form-control'}),
            'p_email': forms.EmailInput(attrs={'class': 'form-control'}),
            'doc_name': forms.Select(attrs={'class': 'form-control'}),
        }
        labels = {
           'p_name':'Patient Name',
           'p_phone':'Phone Number',
           'p_email':'Email',
           'doc_name':'Doctor Name',
           'booking_date':'Booking Date',
           'appointment_time': 'Appointment Time (15-min slots)'
        }
        help_texts = {
            'appointment_time': 'Please select time in 15-minute intervals (e.g., 9:00, 9:15, 9:30, 9:45)'
        }


    def clean(self):
        cleaned_data = super().clean()
        doctor = cleaned_data.get('doc_name')
        date = cleaned_data.get('booking_date')
        time = cleaned_data.get('appointment_time')

        if doctor and date and time:
            # 0. Validate time is in 15-minute intervals
            if time.minute % 15 != 0 or time.second != 0:
                self.add_error('appointment_time', 
                    "⚠️ Appointment times must be in 15-minute intervals (e.g., 9:00, 9:15, 9:30, 9:45)")
                return cleaned_data
            
            # 1. Check if booking date is not in the past
            if date < datetime.date.today():
                self.add_error('booking_date', "Cannot book appointments for past dates. Please select today or a future date.")
                return cleaned_data
            
            # 2. Check for Doctor Leaves
            if DoctorLeave.objects.filter(doctor=doctor, date=date).exists():
                leave = DoctorLeave.objects.get(doctor=doctor, date=date)
                reason = f" (Reason: {leave.reason})" if leave.reason else ""
                self.add_error('booking_date', f"❌ Dr. {doctor.doc_name} is on leave on {date.strftime('%B %d, %Y')}{reason}. Please choose another date.")
                return cleaned_data
            
            # 3. Check for Weekly Availability (Is doctor working on this day?)
            day_of_week = date.weekday()  # Monday is 0, Sunday is 6
            day_name = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day_of_week]
            availability_slots = DoctorAvailability.objects.filter(doctor=doctor, day=day_of_week)
            
            if not availability_slots.exists():
                self.add_error('booking_date', f"❌ Dr. {doctor.doc_name} is not available on {day_name}s. Please choose a different day.")
                
                # Show available days
                available_days = DoctorAvailability.objects.filter(doctor=doctor).values_list('day', flat=True).distinct()
                if available_days:
                    day_names = [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][d] for d in available_days]
                    self.add_error('booking_date', f"ℹ️ Doctor is available on: {', '.join(day_names)}")
                return cleaned_data
            
            # 4. Check if Time Slot is within Doctor's Working Hours
            is_within_hours = False
            valid_slot = None
            for slot in availability_slots:
                if slot.start_time <= time <= slot.end_time:
                    is_within_hours = True
                    valid_slot = slot
                    break
            
            if not is_within_hours:
                # Show available time slots for this day
                slots_info = []
                for slot in availability_slots:
                    slots_info.append(f"{slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}")
                
                self.add_error('appointment_time', 
                    f"❌ The selected time ({time.strftime('%I:%M %p')}) is outside Dr. {doctor.doc_name}'s working hours for {day_name}.")
                self.add_error('appointment_time', 
                    f"ℹ️ Available time slots: {' | '.join(slots_info)}")
                return cleaned_data
            
            # 5. Check for 15-minute buffer (prevent bookings within 15 minutes of existing appointments)
            from datetime import timedelta
            
            # Convert time to datetime for calculation
            time_dt = datetime.datetime.combine(date, time)
            time_before = (time_dt - timedelta(minutes=15)).time()
            time_after = (time_dt + timedelta(minutes=15)).time()
            
            # Check for any bookings within 15-minute window
            conflicting_bookings = Booking.objects.filter(
                doc_name=doctor,
                booking_date=date,
                appointment_time__range=(time_before, time_after)
            ).exclude(status__in=['rejected', 'cancelled'])
            
            # Exact time match
            exact_match = conflicting_bookings.filter(appointment_time=time)
            if exact_match.exists():
                self.add_error('appointment_time', 
                    f"❌ This time slot ({time.strftime('%I:%M %p')} on {date.strftime('%B %d, %Y')}) is already booked.")
                self.add_error('appointment_time', 
                    "ℹ️ Please select a different time slot (at least 15 minutes apart).")
                return cleaned_data
            
            # Within 15-minute window
            if conflicting_bookings.exists():
                # Get the conflicting time
                conflict = conflicting_bookings.first()
                conflict_time = conflict.appointment_time.strftime('%I:%M %p')
                self.add_error('appointment_time', 
                    f"❌ A booking already exists at {conflict_time}. Appointments must be at least 15 minutes apart.")
                self.add_error('appointment_time', 
                    "ℹ️ Please choose a time slot that is at least 15 minutes before or after existing bookings.")
                return cleaned_data
                
        return cleaned_data
