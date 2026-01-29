import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';
import { formatDate, formatTime } from '../../utils/formatters';

const AdminBookings = () => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: bookings, isLoading } = useQuery({
        queryKey: ['admin-bookings', statusFilter],
        queryFn: async () => {
            let url = API_ENDPOINTS.bookings.list;
            if (statusFilter !== 'all') {
                url += `?status=${statusFilter}`;
            }
            const response = await axios.get(url);
            return response.data.results || response.data;
        },
    });

    const filteredBookings = bookings?.filter(booking =>
        booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id?.toString().includes(searchTerm)
    );

    const statusColors = {
        pending: { bg: '#fef3c7', text: '#92400e', icon: 'clock' },
        accepted: { bg: '#d1fae5', text: '#065f46', icon: 'check-circle' },
        rejected: { bg: '#fee2e2', text: '#991b1b', icon: 'times-circle' },
        completed: { bg: '#dbeafe', text: '#1e40af', icon: 'check-double' },
        cancelled: { bg: '#f1f5f9', text: '#475569', icon: 'ban' },
    };

    const filterButtons = [
        { label: 'All', value: 'all', count: bookings?.length },
        { label: 'Pending', value: 'pending', color: '#f59e0b' },
        { label: 'Accepted', value: 'accepted', color: '#10b981' },
        { label: 'Rejected', value: 'rejected', color: '#ef4444' },
        { label: 'Completed', value: 'completed', color: '#3b82f6' },
    ];

    if (isLoading) return <AdminLayout><Loading /></AdminLayout>;

    return (
        <AdminLayout>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>
                    Manage Bookings
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <p style={{ margin: 0, color: '#64748b' }}>
                        {filteredBookings?.length || 0} {statusFilter === 'all' ? 'total' : statusFilter} appointments
                    </p>
                    <div style={{ width: '300px', position: 'relative' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                        <input
                            type="text"
                            placeholder="Search by Patient, Doctor or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem 0.6rem 2.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '0.875rem',
                                backgroundColor: 'white'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                {filterButtons.map(btn => (
                    <button
                        key={btn.value}
                        onClick={() => setStatusFilter(btn.value)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: statusFilter === btn.value ? (btn.color || '#1e293b') : 'white',
                            color: statusFilter === btn.value ? 'white' : '#64748b',
                            border: `2px solid ${statusFilter === btn.value ? (btn.color || '#1e293b') : '#e2e8f0'}`,
                            borderRadius: '0.75rem',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (statusFilter !== btn.value) {
                                e.currentTarget.style.borderColor = btn.color || '#64748b';
                                e.currentTarget.style.color = btn.color || '#1e293b';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (statusFilter !== btn.value) {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.color = '#64748b';
                            }
                        }}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Bookings Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={headerStyle}>ID</th>
                                <th style={headerStyle}>Patient</th>
                                <th style={headerStyle}>Doctor</th>
                                <th style={headerStyle}>Date & Time</th>
                                <th style={headerStyle}>Status</th>
                                <th style={headerStyle}>Booked On</th>
                                <th style={headerStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings?.length > 0 ? filteredBookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={cellStyle}>
                                        <span style={{ fontWeight: 600, color: '#64748b' }}>#{booking.id}</span>
                                    </td>
                                    <td style={cellStyle}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{booking.user_name}</div>
                                            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                                                <i className="fas fa-envelope" style={{ marginRight: '0.25rem' }}></i>
                                                {booking.user_email || 'No email'}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={cellStyle}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>Dr. {booking.doctor_name}</div>
                                            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                                                {booking.doctor_specialization}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={cellStyle}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                                <i className="fas fa-calendar" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
                                                {formatDate(booking.booking_date)}
                                            </div>
                                            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                                                <i className="fas fa-clock" style={{ marginRight: '0.5rem' }}></i>
                                                {formatTime(booking.appointment_time)}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.8125rem',
                                            fontWeight: 600,
                                            backgroundColor: statusColors[booking.status]?.bg || '#f1f5f9',
                                            color: statusColors[booking.status]?.text || '#475569',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.375rem'
                                        }}>
                                            <i className={`fas fa-${statusColors[booking.status]?.icon || 'circle'}`}></i>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            {formatDate(booking.booked_on)}
                                        </div>
                                    </td>
                                    <td style={cellStyle}>
                                        <button
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#f1f5f9',
                                                color: '#3b82f6',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                e.currentTarget.style.color = '#3b82f6';
                                            }}
                                        >
                                            <i className="fas fa-eye" style={{ marginRight: '0.5rem' }}></i>
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                                        <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>No bookings found</div>
                                        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                            {statusFilter !== 'all' ? `No ${statusFilter} appointments` : 'No appointments yet'}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

const headerStyle = {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const cellStyle = {
    padding: '1.25rem 1.5rem',
    color: '#475569'
};

export default AdminBookings;
