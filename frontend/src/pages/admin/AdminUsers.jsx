import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';

const AdminUsers = () => {
    const { data: bookings, isLoading } = useQuery({
        queryKey: ['admin-all-bookings'],
        queryFn: async () => {
            const response = await axios.get('/api/bookings/');
            return response.data.results || response.data;
        },
    });

    // Extract unique users from bookings
    const users = React.useMemo(() => {
        if (!bookings) return [];
        const userMap = new Map();

        bookings.forEach(booking => {
            if (!userMap.has(booking.user)) {
                userMap.set(booking.user, {
                    id: booking.user,
                    name: booking.user_name,
                    email: booking.user_email,
                    totalBookings: 0,
                    pendingBookings: 0,
                    acceptedBookings: 0,
                });
            }

            const user = userMap.get(booking.user);
            user.totalBookings++;
            if (booking.status === 'pending') user.pendingBookings++;
            if (booking.status === 'accepted') user.acceptedBookings++;
        });

        return Array.from(userMap.values());
    }, [bookings]);

    if (isLoading) return <AdminLayout><Loading /></AdminLayout>;

    return (
        <AdminLayout>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>
                    Manage Users
                </h2>
                <p style={{ margin: 0, color: '#64748b' }}>
                    {users.length} registered patients in the system
                </p>
            </div>

            {/* Users Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {users.map((user) => (
                    <div
                        key={user.id}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '1rem',
                            padding: '1.75rem',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s',
                            border: '2px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        {/* User Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: '#dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: '#3b82f6',
                                flexShrink: 0
                            }}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                                    {user.name || 'Unknown User'}
                                </h3>
                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                    <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i>
                                    {user.email || 'No email'}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                padding: '0.875rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '0.75rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.25rem' }}>
                                    {user.totalBookings}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                    Total
                                </div>
                            </div>
                            <div style={{
                                padding: '0.875rem',
                                backgroundColor: '#fef3c7',
                                borderRadius: '0.75rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginBottom: '0.25rem' }}>
                                    {user.pendingBookings}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>
                                    Pending
                                </div>
                            </div>
                            <div style={{
                                padding: '0.875rem',
                                backgroundColor: '#d1fae5',
                                borderRadius: '0.75rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginBottom: '0.25rem' }}>
                                    {user.acceptedBookings}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>
                                    Accepted
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#f1f5f9',
                                color: '#3b82f6',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
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
                            View Bookings
                        </button>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '4rem',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <i className="fas fa-users" style={{ fontSize: '4rem', color: '#e2e8f0', marginBottom: '1rem' }}></i>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                        No Users Yet
                    </h3>
                    <p style={{ margin: 0, color: '#64748b' }}>
                        Users will appear here once they start making bookings
                    </p>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
