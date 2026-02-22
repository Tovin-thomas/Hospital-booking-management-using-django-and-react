import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';

/* ─── Slot colour palette ─────────────────────────────────────────────
   Green  → available     Red (muted) → booked     Blue → selected
 ─────────────────────────────────────────────────────────────────── */
const SLOT_STYLES = {
    available: {
        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
        border: '1.5px solid #34d399',
        color: '#065f46',
        cursor: 'pointer',
    },
    booked: {
        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
        border: '1.5px solid #f87171',
        color: '#ef4444',
        cursor: 'not-allowed',
        textDecoration: 'line-through',
        opacity: 0.85,
    },
    selected: {
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        border: '2px solid #1d4ed8',
        color: '#ffffff',
        cursor: 'pointer',
        boxShadow: '0 0 0 3px rgba(59,130,246,0.35)',
    },
};

const SlotButton = ({ slot, isSelected, onClick }) => {
    const style = SLOT_STYLES[isSelected ? 'selected' : slot.status] || SLOT_STYLES.available;
    return (
        <button
            type="button"
            disabled={slot.status === 'booked'}
            onClick={() => slot.status !== 'booked' && onClick(slot.time)}
            title={slot.status === 'booked' ? 'Already booked' : `Select ${slot.time}`}
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
                ...style,
            }}
        >
            {slot.time}
            {slot.status === 'booked' && (
                <span style={{ fontSize: '0.65rem', color: '#dc2626' }}>Booked</span>
            )}
        </button>
    );
};

const Legend = () => (
    <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center',
        padding: '0.85rem 1.1rem', marginTop: '1.25rem',
        background: 'var(--color-gray-50, #f9fafb)',
        border: '1px solid var(--color-gray-200, #e5e7eb)',
        borderRadius: '0.6rem',
    }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Legend
        </span>
        {[
            { label: 'Available', bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', border: '#34d399' },
            { label: 'Booked', bg: 'linear-gradient(135deg,#fee2e2,#fecaca)', border: '#f87171' },
            { label: 'Selected', bg: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: '#1d4ed8' },
        ].map(({ label, bg, border }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: '#374151' }}>
                <span style={{ width: '1.15rem', height: '1.15rem', borderRadius: '0.25rem', background: bg, border: `1.5px solid ${border}`, display: 'inline-block' }} />
                {label}
            </span>
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════ */

const Booking = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    /* ── Doctor details ── */
    const { data: doctor, isLoading: doctorLoading } = useQuery({
        queryKey: ['doctor', doctorId],
        queryFn: async () => {
            const res = await axios.get(API_ENDPOINTS.doctors.detail(doctorId));
            return res.data;
        },
    });

    /* ── All slots for selected date (available + booked) ── */
    const { data: slotsData, isLoading: slotsLoading, error: slotsError } = useQuery({
        queryKey: ['slots', doctorId, selectedDate],
        queryFn: async () => {
            const res = await axios.get(API_ENDPOINTS.doctors.availableSlots(doctorId, selectedDate));
            return res.data;
        },
        enabled: !!selectedDate && selectedDate.length === 10,
    });

    /* ── Create booking — DB constraints handle all duplicate logic ── */
    const createBooking = useMutation({
        mutationFn: async (data) => {
            const res = await axios.post(API_ENDPOINTS.bookings.create, data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Booking created successfully!');
            navigate('/my-bookings');
        },
        onError: (error) => {
            const data = error.response?.data;
            const message =
                data?.detail ||
                data?.booking_date?.[0] ||
                data?.appointment_time?.[0] ||
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

    const totalSlots = slotsData?.slots?.length ?? 0;
    const availableCount = slotsData?.available_slots ?? 0;
    const bookedCount = totalSlots - availableCount;

    return (
        <div style={{ padding: '3rem 0', backgroundColor: 'var(--color-gray-50)', minHeight: 'calc(100vh - 200px)' }}>
            <div className="container-sm">
                <h1 style={{ marginBottom: '2rem' }}>Book Appointment</h1>

                {/* Doctor info */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>{doctor?.doc_name}</h3>
                    <p style={{ color: 'var(--color-primary)' }}>{doctor?.doc_spec}</p>
                    <p style={{ color: 'var(--color-gray-600)' }}>{doctor?.department?.dep_name}</p>
                </div>

                {/* Booking form */}
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.975rem', marginBottom: '1.5rem' }}>
                            Your contact details (Name, Email, Phone) will be automatically filled from your profile.
                        </p>

                        <h3 style={{ marginBottom: '1.5rem' }}>Select Date &amp; Time</h3>

                        {/* Date picker */}
                        <div className="form-group">
                            <label className="form-label">Appointment Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={selectedDate}
                                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                                min={new Date().toISOString().split('T')[0]}
                                max={new Date(new Date().setDate(new Date().getDate() + 60)).toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {/* Slot picker */}
                        {selectedDate && (
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label className="form-label">Appointment Time *</label>

                                {slotsLoading ? (
                                    <Loading size="sm" text="Loading slots…" />
                                ) : slotsError ? (
                                    <p style={{ color: 'var(--color-danger)', marginTop: '0.5rem' }}>
                                        Error fetching slots. Try a different date.
                                    </p>
                                ) : slotsData?.available ? (
                                    <div>
                                        {/* Working hours + count chips */}
                                        {slotsData.working_hours && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', margin: 0 }}>
                                                    🕐 <strong>{slotsData.working_hours.start} – {slotsData.working_hours.end}</strong>
                                                </p>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', fontSize: '0.78rem', fontWeight: 600 }}>
                                                        ✓ {availableCount} Available
                                                    </span>
                                                    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '0.78rem', fontWeight: 600 }}>
                                                        ✗ {bookedCount} Booked
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Slot grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.6rem' }}>
                                            {slotsData.slots.map((slot) => (
                                                <SlotButton
                                                    key={slot.time}
                                                    slot={slot}
                                                    isSelected={selectedTime === slot.time}
                                                    onClick={setSelectedTime}
                                                />
                                            ))}
                                        </div>
                                        <Legend />
                                    </div>
                                ) : (
                                    /* Doctor unavailable */
                                    <div style={{ padding: '1.5rem', background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '0.75rem', display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                                        <div style={{ width: 48, height: 48, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className="fas fa-calendar-times" style={{ fontSize: '1.25rem', color: '#dc2626' }} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.5rem', color: '#991b1b', fontSize: '1rem' }}>Doctor Unavailable</h4>
                                            <p style={{ margin: 0, color: '#7f1d1d' }}>{slotsData?.reason}</p>
                                            <p style={{ margin: '0.5rem 0 0', color: '#991b1b', fontSize: '0.875rem', fontStyle: 'italic' }}>
                                                Please select a different date.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selected time badge */}
                        {selectedTime && (
                            <div style={{ marginTop: '1rem', padding: '0.6rem 1rem', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1.5px solid #93c5fd', borderRadius: '0.5rem', color: '#1d4ed8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-clock" /> Selected slot: {selectedTime}
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
