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
    const [formData, setFormData] = useState({
        p_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
        p_phone: '',
        p_email: user?.email || '',
    });

    // Fetch doctor details
    const { data: doctor, isLoading: doctorLoading } = useQuery({
        queryKey: ['doctor', doctorId],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.doctors.detail(doctorId));
            return response.data;
        },
    });

    // Fetch available slots when date is selected
    const { data: slotsData, isLoading: slotsLoading } = useQuery({
        queryKey: ['slots', doctorId, selectedDate],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.doctors.availableSlots(doctorId, selectedDate));
            return response.data;
        },
        enabled: !!selectedDate,
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
            ...formData,
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
                        <h3 style={{ marginBottom: '1.5rem' }}>Patient Information</h3>

                        <div className="form-group">
                            <label className="form-label">Patient Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.p_name}
                                onChange={(e) => setFormData({ ...formData, p_name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number *</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.p_phone}
                                onChange={(e) => setFormData({ ...formData, p_phone: e.target.value })}
                                required
                                pattern="[0-9]{10}"
                                placeholder="10 digits"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.p_email}
                                onChange={(e) => setFormData({ ...formData, p_email: e.target.value })}
                                required
                            />
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
                                required
                            />
                        </div>

                        {selectedDate && (
                            <div className="form-group">
                                <label className="form-label">Appointment Time *</label>
                                {slotsLoading ? (
                                    <Loading size="sm" text="Loading available slots..." />
                                ) : slotsData?.available ? (
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
                                    <p style={{ color: 'var(--color-error)' }}>{slotsData?.reason}</p>
                                )}
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
