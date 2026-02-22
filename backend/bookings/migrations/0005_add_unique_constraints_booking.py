from django.db import migrations, models
from django.db.models import Count, Max


# ─────────────────────────────────────────────────────────────────────
# Step 1: Clean up existing duplicate data BEFORE adding the constraints
# ─────────────────────────────────────────────────────────────────────

def cancel_duplicate_patient_bookings(apps, schema_editor):
    """
    For every group of (user + doctor + date) that has MORE THAN ONE
    active (pending/accepted) booking, keep only the most recent one
    (highest id) and cancel all the older duplicates.

    This cleans up old data so the unique index can be created cleanly.
    """
    Booking = apps.get_model('bookings', 'Booking')

    # Find groups with more than one active booking
    duplicate_groups = (
        Booking.objects
        .filter(status__in=['pending', 'accepted'])
        .values('user_id', 'doc_name_id', 'booking_date')
        .annotate(total=Count('id'), keep_id=Max('id'))
        .filter(total__gt=1)
    )

    for group in duplicate_groups:
        # Cancel every booking in this group EXCEPT the latest one
        Booking.objects.filter(
            user_id=group['user_id'],
            doc_name_id=group['doc_name_id'],
            booking_date=group['booking_date'],
            status__in=['pending', 'accepted'],
        ).exclude(id=group['keep_id']).update(status='cancelled')


def cancel_duplicate_slot_bookings(apps, schema_editor):
    """
    For every group of (doctor + date + time) that has MORE THAN ONE
    active booking, keep only the most recent one and cancel the rest.
    """
    Booking = apps.get_model('bookings', 'Booking')

    duplicate_groups = (
        Booking.objects
        .filter(status__in=['pending', 'accepted'])
        .exclude(appointment_time__isnull=True)
        .values('doc_name_id', 'booking_date', 'appointment_time')
        .annotate(total=Count('id'), keep_id=Max('id'))
        .filter(total__gt=1)
    )

    for group in duplicate_groups:
        Booking.objects.filter(
            doc_name_id=group['doc_name_id'],
            booking_date=group['booking_date'],
            appointment_time=group['appointment_time'],
            status__in=['pending', 'accepted'],
        ).exclude(id=group['keep_id']).update(status='cancelled')


# ─────────────────────────────────────────────────────────────────────
# Step 2: Now safely add the unique constraints
# ─────────────────────────────────────────────────────────────────────

class Migration(migrations.Migration):
    """
    Two-phase migration:
    Phase 1  →  RunPython: cancel old duplicate bookings in the database.
    Phase 2  →  AddConstraint: create partial unique indexes so future
                duplicates are blocked at the database level.
    """

    dependencies = [
        ('bookings', '0004_alter_booking_p_phone'),
    ]

    operations = [
        # ── Phase 1: clean dirty data ─────────────────────────────────
        migrations.RunPython(
            cancel_duplicate_patient_bookings,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.RunPython(
            cancel_duplicate_slot_bookings,
            reverse_code=migrations.RunPython.noop,
        ),

        # ── Phase 2: add the constraints ──────────────────────────────
        migrations.AddConstraint(
            model_name='booking',
            constraint=models.UniqueConstraint(
                condition=models.Q(status__in=['pending', 'accepted']),
                fields=['user', 'doc_name', 'booking_date'],
                name='unique_active_booking_per_user_doctor_date',
            ),
        ),
        migrations.AddConstraint(
            model_name='booking',
            constraint=models.UniqueConstraint(
                condition=models.Q(status__in=['pending', 'accepted']),
                fields=['doc_name', 'booking_date', 'appointment_time'],
                name='unique_active_slot_per_doctor_date_time',
            ),
        ),
    ]
