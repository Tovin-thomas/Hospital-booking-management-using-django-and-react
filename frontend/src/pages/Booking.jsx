import React, { useState, useEffect } from 'react';
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

/* ─── Date helpers ────────────────────────────────────── */
const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* Walk forward from today (inclusive) to find the nearest day the
   doctor actually works. Returns a YYYY-MM-DD string or todayStr(). */
const getFirstAvailableDate = (availabilities = []) => {
    if (!availabilities.length) return todayStr();
    const DAY_NUM_MAP = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
    const availDayNums = new Set(availabilities.map(a => DAY_NUM_MAP[a.day_display]));
    const d = new Date();
    for (let i = 0; i < 62; i++) {         // check up to 62 days ahead
        if (availDayNums.has(d.getDay())) {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        d.setDate(d.getDate() + 1);
    }
    return todayStr();                      // fallback — should never happen
};

/* ─── Available-days strip ───────────────────────────────────── */
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AvailableDaysStrip = ({ availabilities }) => {
    if (!availabilities) return null;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const availSet = new Set(availabilities.map(a => a.day_display));

    return (
        <div style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
        }}>
            <p style={{
                margin: '0 0 0.6rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            }}>
                <i className="fas fa-calendar-week" style={{ marginRight: '0.4rem', color: '#2563eb' }} />
                Doctor available on
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {ALL_DAYS.map((day, i) => {
                    const isAvail = availSet.has(day);
                    const isToday = day === today;
                    const avail = availabilities.find(a => a.day_display === day);
                    return (
                        <span
                            key={day}
                            title={isAvail ? `${day}: ${avail.start_time.slice(0, 5)}–${avail.end_time.slice(0, 5)}` : `Not available on ${day}`}
                            style={{
                                padding: '0.3rem 0.65rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'default',
                                // today + available → vivid green
                                // other available   → blue
                                // not available     → grey-ish muted
                                background: isAvail && isToday ? '#dcfce7'
                                    : isAvail ? '#dbeafe'
                                        : '#f1f5f9',
                                color: isAvail && isToday ? '#15803d'
                                    : isAvail ? '#1d4ed8'
                                        : '#94a3b8',
                                border: `1.5px solid ${isAvail && isToday ? '#86efac'
                                    : isAvail ? '#93c5fd'
                                        : '#e2e8f0'
                                    }`,
                                position: 'relative',
                            }}
                        >
                            {SHORT[i]}
                            {isAvail && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-3px',
                                    right: '-3px',
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    background: isToday ? '#22c55e' : '#3b82f6',
                                    border: '1.5px solid white',
                                }} />
                            )}
                        </span>
                    );
                })}
            </div>
            {availabilities.length > 0 && (
                <p style={{ margin: '0.6rem 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                    💡 Hover a day pill to see working hours. Pick a highlighted date above.
                </p>
            )}
        </div>
    );
};

/* ─── UnavailableCard ─────────────────────────────────────────────────
   Shows why the doctor is unavailable and suggests the NEXT 3 available
   dates so the user can pick one with a single click.
 ───────────────────────────────────────────────────────────────────── */
const DAY_NUM = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };

function getNextAvailableDates(availabilities = [], fromDate, count = 3) {
    if (!availabilities.length) return [];
    const availDayNums = new Set(availabilities.map(a => DAY_NUM[a.day_display]));
    const results = [];
    const d = new Date(fromDate);
    d.setDate(d.getDate() + 1);           // start from tomorrow
    const limit = new Date(fromDate);
    limit.setDate(limit.getDate() + 61);  // don't exceed the 60-day booking window

    while (results.length < count && d < limit) {
        if (availDayNums.has(d.getDay())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const avail = availabilities.find(a => DAY_NUM[a.day_display] === d.getDay());
            results.push({
                dateStr: `${yyyy}-${mm}-${dd}`,
                label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
                hours: avail ? `${avail.start_time.slice(0, 5)}–${avail.end_time.slice(0, 5)}` : '',
            });
        }
        d.setDate(d.getDate() + 1);
    }
    return results;
}

const UnavailableCard = ({ reason, availabilities, currentDate, onPickDate }) => {
    const nextDates = getNextAvailableDates(availabilities, currentDate);

    return (
        <div style={{
            marginTop: '0.75rem',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: '1.5px solid #fca5a5',
        }}>
            {/* ── Top red header banner ── */}
            <div style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
            }}>
                <div style={{
                    width: 44, height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <i className="fas fa-calendar-times" style={{ fontSize: '1.2rem', color: 'white' }} />
                </div>
                <div>
                    <h4 style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                        Doctor Unavailable
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
                        {reason || 'Not scheduled on the selected date'}
                    </p>
                </div>
            </div>

            {/* ── Bottom suggestion area ── */}
            <div style={{
                background: '#fff7f7',
                padding: '1.1rem 1.25rem',
            }}>
                {nextDates.length > 0 ? (
                    <>
                        <p style={{
                            margin: '0 0 0.85rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            <i className="fas fa-lightbulb" style={{ color: '#f59e0b', marginRight: '0.4rem' }} />
                            Next available slots — click to switch date
                        </p>
                        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                            {nextDates.map(({ dateStr, label, hours }) => (
                                <button
                                    key={dateStr}
                                    type="button"
                                    onClick={() => onPickDate(dateStr)}
                                    style={{
                                        padding: '0.55rem 1rem',
                                        borderRadius: '0.65rem',
                                        border: '1.5px solid #bfdbfe',
                                        background: 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.18s ease',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = '#eff6ff';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.borderColor = '#bfdbfe';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                                        {label}
                                    </div>
                                    {hours && (
                                        <div style={{ fontSize: '0.72rem', color: '#2563eb', marginTop: '0.15rem' }}>
                                            <i className="fas fa-clock" style={{ marginRight: '0.25rem' }} />
                                            {hours}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.875rem' }}>
                        <i className="fas fa-info-circle" style={{ marginRight: '0.4rem' }} />
                        No available slots found in the next 60 days. Please contact the hospital directly.
                    </p>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════ */

const Booking = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(todayStr);  // refined after doctor loads
    const [selectedTime, setSelectedTime] = useState('');

    /* ── Doctor details ── */
    const { data: doctor, isLoading: doctorLoading } = useQuery({
        queryKey: ['doctor', doctorId],
        queryFn: async () => {
            const res = await axios.get(API_ENDPOINTS.doctors.detail(doctorId));
            return res.data;
        },
    });

    /* ── Once doctor loads, jump to the nearest working day ── */
    useEffect(() => {
        if (doctor?.availabilities) {
            const best = getFirstAvailableDate(doctor.availabilities);
            setSelectedDate(best);
            setSelectedTime('');
        }
    }, [doctor?.id]);               // run once per doctor, not on every render

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

                {/* ── Doctor info card ─────────────────────────── */}
                <div className="card" style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem 1.5rem',
                    background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: '1rem',
                }}>
                    {/* Avatar / image */}
                    <div style={{
                        width: 72, height: 72,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        border: '3px solid white',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                    }}>
                        {doctor?.doc_image_url ? (
                            <img src={doctor.doc_image_url} alt={doctor.doc_name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                        ) : (
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                                {(doctor?.doc_name || 'DR').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')}
                            </span>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.2rem', fontWeight: 700 }}>Dr. {doctor?.doc_name}</h3>
                        <p style={{ margin: '0 0 0.4rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem' }}>{doctor?.doc_spec}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {doctor?.department_name && (
                                <span style={{ padding: '0.2rem 0.7rem', borderRadius: '9999px', background: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700 }}>
                                    {doctor.department_name}
                                </span>
                            )}
                            {doctor?.availabilities?.length > 0 && (
                                <span style={{ padding: '0.2rem 0.7rem', borderRadius: '9999px', background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700 }}>
                                    <i className="fas fa-clock" style={{ marginRight: '0.3rem' }} />
                                    {doctor.availabilities.length} working day{doctor.availabilities.length !== 1 ? 's' : ''}/week
                                </span>
                            )}
                        </div>
                    </div>
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
                            {/* ── Show doctor's weekly schedule ── */}
                            <AvailableDaysStrip availabilities={doctor?.availabilities} />
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
                                    /* ── Doctor unavailable — premium UX ── */
                                    <UnavailableCard
                                        reason={slotsData?.reason}
                                        availabilities={doctor?.availabilities}
                                        currentDate={selectedDate}
                                        onPickDate={(d) => { setSelectedDate(d); setSelectedTime(''); }}
                                    />
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
