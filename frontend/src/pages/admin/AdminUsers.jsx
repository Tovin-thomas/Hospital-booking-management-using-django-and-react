import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';

const AdminUsers = () => {
    // Fetch Users
    const { data: usersList, isLoading: isLoadingUsers, error: usersError } = useQuery({
        queryKey: ['admin-users-list'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.users.list);
            return response.data.results || response.data;
        },
    });

    // Fetch Bookings for Stats
    const { data: bookingsList, isLoading: isLoadingBookings } = useQuery({
        queryKey: ['admin-all-bookings'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.bookings.list);
            return response.data.results || response.data;
        },
    });

    // Combine Data
    const users = React.useMemo(() => {
        if (!usersList) return [];

        return usersList.map(user => {
            // Find bookings for this user
            const userBookings = bookingsList?.filter(b => b.user === user.id) || [];

            return {
                id: user.id,
                name: (user.first_name || user.last_name) ? `${user.first_name} ${user.last_name}`.trim() : user.username,
                username: user.username,
                email: user.email,
                role: user.role || (user.is_superuser ? 'Admin' : 'User'),
                totalBookings: userBookings.length,
                pendingBookings: userBookings.filter(b => b.status === 'pending').length,
                acceptedBookings: userBookings.filter(b => b.status === 'accepted').length,
            };
        });
    }, [usersList, bookingsList]);

    if (isLoadingUsers || isLoadingBookings) return <AdminLayout><Loading /></AdminLayout>;

    if (usersError) return (
        <AdminLayout>
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Error Loading Users</h3>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1rem' }}>
                    {usersError.message}
                </p>
                {usersError.response?.status === 404 && (
                    <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block' }}>
                        <strong>Tip:</strong> The 404 error means the server can't find the new endpoint.<br />
                        Please <u>restart your backend server</u> to apply the latest changes.
                    </div>
                )}
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>
                    Manage Users
                </h2>
                <p style={{ margin: 0, color: '#64748b' }}>
                    {users.length} registered users
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
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        {/* User Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: user.role === 'admin' ? '#fef3c7' : '#dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: user.role === 'admin' ? '#d97706' : '#3b82f6',
                                flexShrink: 0
                            }}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user.name}
                                </h3>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span>@{user.username}</span>
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || 'No email'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.1rem' }}>
                                    {user.totalBookings}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Bookings
                                </div>
                            </div>
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#fffbeb',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                border: '1px solid #fef3c7'
                            }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginBottom: '0.1rem' }}>
                                    {user.pendingBookings}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Pending
                                </div>
                            </div>
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#ecfdf5',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                border: '1px solid #a7f3d0'
                            }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginBottom: '0.1rem' }}>
                                    {user.acceptedBookings}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Active
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                            User ID: {user.id}
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && !isLoadingUsers && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '4rem',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <i className="fas fa-users" style={{ fontSize: '4rem', color: '#e2e8f0', marginBottom: '1rem' }}></i>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                        No Users Found
                    </h3>
                    <p style={{ margin: 0, color: '#64748b' }}>
                        The system has no registered users yet.
                    </p>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
