import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

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

    // Fetch available slots when date is selected
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
            const message = error.response?.data?.booking_date?.[0] ||
                error.response?.data?.appointment_time?.[0] ||
                'Failed to create booking';
            toast.error(message);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedDate || !selectedTime) {
            toast.error('Please select date and time');
            return;
        }

        createBooking.mutate({
            doctor_id: parseInt(doctorId),
            booking_date: selectedDate,
            appointment_time: selectedTime,
        });
    };

    if (doctorLoading) return <Loading />;

    return (
        <div style={{ padding: '3rem 0', backgroundColor: 'var(--color-gray-50)', minHeight: 'calc(100vh - 200px)' }}>
            <div className="container-sm">
                <h1 style={{ marginBottom: '2rem' }}>Book Appointment</h1>

                {/* Doctor Info */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>{doctor?.doc_name}</h3>
                    <p style={{ color: 'var(--color-primary)' }}>{doctor?.doc_spec}</p>
                    <p style={{ color: 'var(--color-gray-600)' }}>{doctor?.department.dep_name}</p>
                </div>

                {/* Booking Form */}
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: 'var(--color-gray-600)', fontSize: '0.975rem' }}>
                                Your contact details (Name, Email, Phone) will be automatically filled from your profile.
                            </p>
                        </div>

                        <h3 style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>Select Date & Time</h3>

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
                                max={new Date(new Date().setDate(new Date().getDate() + 60)).toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {selectedDate && (
                            <div className="form-group">
                                <label className="form-label">Appointment Time *</label>
                                {slotsLoading ? (
                                    <Loading size="sm" text="Loading available slots..." />
                                ) : slotsError ? (
                                    <p style={{ color: 'var(--color-danger)' }}>
                                        Invalid date or error fetching slots.
                                    </p>
                                ) : slotsData ? (
                                    slotsData.available ? (
                                        <div>
                                            {slotsData.working_hours && (
                                                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: '1rem' }}>
                                                    Working hours: {slotsData.working_hours.start} - {slotsData.working_hours.end}
                                                </p>
                                            )}
                                            {slotsData.slots && slotsData.slots.length > 0 ? (
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                                    gap: '0.5rem',
                                                }}>
                                                    {slotsData.slots.map(slot => (
                                                        <button
                                                            key={slot.time}
                                                            type="button"
                                                            onClick={() => setSelectedTime(slot.time)}
                                                            disabled={!slot.available}
                                                            className={`btn btn-sm ${selectedTime === slot.time ? 'btn-primary' :
                                                                slot.available ? 'btn-outline' : 'btn-secondary'
                                                                }`}
                                                            style={{
                                                                opacity: slot.available ? 1 : 0.5,
                                                                cursor: slot.available ? 'pointer' : 'not-allowed',
                                                            }}
                                                        >
                                                            {slot.time}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ color: 'var(--color-gray-600)' }}>
                                                    All slots are booked. Please select another date.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '1.5rem',
                                            backgroundColor: '#fef2f2',
                                            border: '2px solid #fecaca',
                                            borderRadius: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem'
                                        }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                backgroundColor: '#fee2e2',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <i className="fas fa-calendar-times" style={{ fontSize: '1.25rem', color: '#dc2626' }}></i>
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

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '1.5rem' }}
                            disabled={createBooking.isPending || !selectedTime}
                        >
                            {createBooking.isPending ? 'Creating Booking...' : 'Confirm Booking'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Booking;
