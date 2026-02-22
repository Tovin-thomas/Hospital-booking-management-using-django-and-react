import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

/* ─── Slot colour legend ──────────────────────────────────────────────
   ●  Teal / green  →  available
   ●  Red  (muted)  →  booked / unavailable
   ●  Blue (solid)  →  your current selection
 ─────────────────────────────────────────────────────────────────── */

const SLOT_STYLES = {
    available: {
        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
        border: '1.5px solid #34d399',
        color: '#065f46',
        cursor: 'pointer',
        opacity: 1,
    },
    booked: {
        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
        border: '1.5px solid #f87171',
        color: '#ef4444',
        cursor: 'not-allowed',
        opacity: 0.85,
        textDecoration: 'line-through',
    },
    selected: {
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        border: '2px solid #1d4ed8',
        color: '#ffffff',
        cursor: 'pointer',
        opacity: 1,
        boxShadow: '0 0 0 3px rgba(59,130,246,0.35)',
    },
};

const SlotButton = ({ slot, isSelected, onClick }) => {
    const styleKey = isSelected ? 'selected' : slot.status;
    const base = SLOT_STYLES[styleKey] || SLOT_STYLES.available;

    return (
        <button
            type="button"
            disabled={slot.status === 'booked'}
            onClick={() => slot.status !== 'booked' && onClick(slot.time)}
            title={slot.status === 'booked' ? 'Already booked' : `Click to select ${slot.time}`}
            style={{
                padding: '0.55rem 0.4rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.2rem',
                position: 'relative',
                ...base,
            }}
        >
            {slot.time}
            {slot.status === 'booked' && (
                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#dc2626', letterSpacing: '0.02em' }}>
                    Booked
                </span>
            )}
        </button>
    );
};

const Legend = () => (
    <div
        style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            alignItems: 'center',
            padding: '0.85rem 1.1rem',
            background: 'var(--color-gray-50, #f9fafb)',
            border: '1px solid var(--color-gray-200, #e5e7eb)',
            borderRadius: '0.6rem',
            marginTop: '1.25rem',
        }}
    >
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gray-500, #6b7280)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Legend
        </span>

        {[
            { label: 'Available', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', border: '#34d399', color: '#065f46' },
            { label: 'Booked', bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', border: '#f87171', color: '#ef4444' },
            { label: 'Selected', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: '#1d4ed8', color: '#fff' },
        ].map(({ label, bg, border, color }) => (
            <span
                key={label}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--color-gray-700, #374151)' }}
            >
                <span
                    style={{
                        width: '1.15rem',
                        height: '1.15rem',
                        borderRadius: '0.25rem',
                        background: bg,
                        border: `1.5px solid ${border}`,
                        display: 'inline-block',
                        flexShrink: 0,
                    }}
                />
                {label}
            </span>
        ))}
    </div>
);

const Booking = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    // Fetch doctor details
    const { data: doctor, isLoading: doctorLoading } = useQuery({
        queryKey: ['doctor', doctorId],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.doctors.detail(doctorId));
            return response.data;
        },
    });

    // Fetch ALL slots (available + booked) when date is selected
    const { data: slotsData, isLoading: slotsLoading, error: slotsError } = useQuery({
        queryKey: ['slots', doctorId, selectedDate],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.doctors.availableSlots(doctorId, selectedDate));
            return response.data;
        },
        enabled: !!selectedDate && selectedDate.length === 10,
    });

    // Create booking mutation
    const createBooking = useMutation({
        mutationFn: async (bookingData) => {
            const response = await axios.post(API_ENDPOINTS.bookings.create, bookingData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Booking created successfully!');
            navigate('/my-bookings');
        },
        onError: (error) => {
            const message =
                error.response?.data?.booking_date?.[0] ||
                error.response?.data?.appointment_time?.[0] ||
                'Failed to create booking';
            toast.error(message);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) {
            toast.error('Please select a date and time slot');
            return;
        }
        createBooking.mutate({
            doctor_id: parseInt(doctorId),
            booking_date: selectedDate,
            appointment_time: selectedTime,
        });
    };

    if (doctorLoading) return <Loading />;

    /* stats derived from slot data */
    const totalSlots = slotsData?.slots?.length ?? 0;
    const availableCount = slotsData?.available_slots ?? 0;
    const bookedCount = totalSlots - availableCount;

    return (
        <div style={{ padding: '3rem 0', backgroundColor: 'var(--color-gray-50)', minHeight: 'calc(100vh - 200px)' }}>
            <div className="container-sm">
                <h1 style={{ marginBottom: '2rem' }}>Book Appointment</h1>

                {/* ── Doctor Info Card ── */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>{doctor?.doc_name}</h3>
                    <p style={{ color: 'var(--color-primary)' }}>{doctor?.doc_spec}</p>
                    <p style={{ color: 'var(--color-gray-600)' }}>{doctor?.department?.dep_name}</p>
                </div>

                {/* ── Booking Form ── */}
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: 'var(--color-gray-600)', fontSize: '0.975rem' }}>
                                Your contact details (Name, Email, Phone) will be automatically filled from your profile.
                            </p>
                        </div>

                        <h3 style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>Select Date &amp; Time</h3>

                        {/* Date Picker */}
                        <div className="form-group">
                            <label className="form-label">Appointment Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedTime('');
                                }}
                                min={new Date().toISOString().split('T')[0]}
                                max={new Date(new Date().setDate(new Date().getDate() + 60))
                                    .toISOString()
                                    .split('T')[0]}
                                required
                            />
                        </div>

                        {/* ── Slot Picker ── */}
                        {selectedDate && (
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label className="form-label">Appointment Time *</label>

                                {slotsLoading ? (
                                    <Loading size="sm" text="Loading slots…" />
                                ) : slotsError ? (
                                    <p style={{ color: 'var(--color-danger)' }}>
                                        Invalid date or error fetching slots.
                                    </p>
                                ) : slotsData ? (
                                    slotsData.available ? (
                                        <div>
                                            {/* Working-hours banner */}
                                            {slotsData.working_hours && (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        flexWrap: 'wrap',
                                                        gap: '0.5rem',
                                                        marginBottom: '1rem',
                                                    }}
                                                >
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', margin: 0 }}>
                                                        🕐 Working hours:{' '}
                                                        <strong>
                                                            {slotsData.working_hours.start} – {slotsData.working_hours.end}
                                                        </strong>
                                                    </p>
                                                    {/* Slot count chips */}
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <span
                                                            style={{
                                                                padding: '0.2rem 0.65rem',
                                                                borderRadius: '999px',
                                                                background: '#d1fae5',
                                                                color: '#065f46',
                                                                border: '1px solid #6ee7b7',
                                                                fontSize: '0.78rem',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            ✓ {availableCount} Available
                                                        </span>
                                                        <span
                                                            style={{
                                                                padding: '0.2rem 0.65rem',
                                                                borderRadius: '999px',
                                                                background: '#fee2e2',
                                                                color: '#b91c1c',
                                                                border: '1px solid #fca5a5',
                                                                fontSize: '0.78rem',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            ✗ {bookedCount} Booked
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Slots grid */}
                                            {slotsData.slots && slotsData.slots.length > 0 ? (
                                                <>
                                                    <div
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                                                            gap: '0.6rem',
                                                        }}
                                                    >
                                                        {slotsData.slots.map((slot) => (
                                                            <SlotButton
                                                                key={slot.time}
                                                                slot={slot}
                                                                isSelected={selectedTime === slot.time}
                                                                onClick={setSelectedTime}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Legend */}
                                                    <Legend />
                                                </>
                                            ) : (
                                                <p style={{ color: 'var(--color-gray-600)' }}>
                                                    No slots found for this day.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        /* Doctor unavailable banner */
                                        <div
                                            style={{
                                                padding: '1.5rem',
                                                backgroundColor: '#fef2f2',
                                                border: '2px solid #fecaca',
                                                borderRadius: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '1rem',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    backgroundColor: '#fee2e2',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <i className="fas fa-calendar-times" style={{ fontSize: '1.25rem', color: '#dc2626' }} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 0.5rem', color: '#991b1b', fontSize: '1rem', fontWeight: 600 }}>
                                                    Doctor Unavailable
                                                </h4>
                                                <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.9375rem' }}>
                                                    {slotsData?.reason}
                                                </p>
                                                <p style={{ margin: '0.75rem 0 0', color: '#991b1b', fontSize: '0.875rem', fontStyle: 'italic' }}>
                                                    Please select a different date to see available time slots.
                                                </p>
                                            </div>
                                        </div>
                                    )
                                ) : null}
                            </div>
                        )}

                        {/* Selected-time confirmation badge */}
                        {selectedTime && (
                            <div
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.6rem 1rem',
                                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                    border: '1.5px solid #93c5fd',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: '#1d4ed8',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <i className="fas fa-clock" />
                                Selected slot: {selectedTime}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '1.5rem' }}
                            disabled={createBooking.isPending || !selectedTime}
                        >
                            {createBooking.isPending ? 'Creating Booking…' : 'Confirm Booking'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Booking;
