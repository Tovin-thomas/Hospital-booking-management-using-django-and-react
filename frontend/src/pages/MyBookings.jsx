import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';
import { formatDate, formatTime, getStatusColor, getStatusText } from '../utils/formatters';
import { toast } from 'react-toastify';

const MyBookings = () => {
    const queryClient = useQueryClient();

    const { data: bookings, isLoading } = useQuery({
        queryKey: ['my-bookings'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.bookings.list);
            return response.data.results || response.data;
        },
    });

    const cancelBooking = useMutation({
        mutationFn: async (bookingId) => {
            const response = await axios.post(API_ENDPOINTS.bookings.cancel(bookingId));
            return response.data;
        },
        onSuccess: () => {
            toast.success('Booking cancelled successfully');
            queryClient.invalidateQueries(['my-bookings']);
        },
        onError: (error) => {
            const message = error.response?.data?.error || 'Failed to cancel booking';
            toast.error(message);
        },
    });

    const handleCancel = (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            cancelBooking.mutate(bookingId);
        }
    };

    return (
        <div style={{ padding: '3rem 0', backgroundColor: 'var(--color-gray-50)', minHeight: 'calc(100vh - 200px)' }}>
            <div className="container">
                <h1 style={{ marginBottom: '2rem' }}>My Bookings</h1>

                {isLoading ? (
                    <Loading />
                ) : bookings && bookings.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {bookings.map(booking => (
                            <div key={booking.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ marginBottom: '0.5rem' }}>{booking.doctor_name}</h3>
                                        <p style={{ color: 'var(--color-gray-600)', marginBottom: '0.5rem' }}>
                                            Patient: {booking.p_name}
                                        </p>
                                        <p style={{ color: 'var(--color-gray-600)', marginBottom: '0.5rem' }}>
                                            📅 {formatDate(booking.booking_date)} at {formatTime(booking.appointment_time)}
                                        </p>
                                        <span className={`badge ${getStatusColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </div>

                                    {(booking.status === 'pending' || booking.status === 'accepted') && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="btn btn-sm btn-danger"
                                            disabled={cancelBooking.isPending}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '1.125rem', color: 'var(--color-gray-600)' }}>
                            You don't have any bookings yet.
                        </p>
                        <a href="/doctors" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Book an Appointment
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
