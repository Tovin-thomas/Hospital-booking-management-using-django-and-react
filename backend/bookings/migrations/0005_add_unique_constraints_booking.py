from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds two partial unique indexes to the bookings_booking table:

    1. unique_active_booking_per_user_doctor_date
       → A patient cannot have more than one active (pending/accepted)
         booking with the same doctor on the same date.

    2. unique_active_slot_per_doctor_date_time
       → A doctor cannot have two active (pending/accepted) bookings
         at the same time on the same date (slot collision).

    Both are PARTIAL indexes (PostgreSQL / SQLite 3.8+) — they only
    cover rows where status IN ('pending', 'accepted').
    Cancelled / completed / rejected bookings are excluded, so a
    patient can re-book the same doctor on the same day after a
    cancellation without issue.
    """

    dependencies = [
        ("bookings", "0004_alter_booking_p_phone"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="booking",
            constraint=models.UniqueConstraint(
                condition=models.Q(status__in=["pending", "accepted"]),
                fields=["user", "doc_name", "booking_date"],
                name="unique_active_booking_per_user_doctor_date",
            ),
        ),
        migrations.AddConstraint(
            model_name="booking",
            constraint=models.UniqueConstraint(
                condition=models.Q(status__in=["pending", "accepted"]),
                fields=["doc_name", "booking_date", "appointment_time"],
                name="unique_active_slot_per_doctor_date_time",
            ),
        ),
    ]
