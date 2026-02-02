import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';

const AdminUsers = () => {
    const queryClient = useQueryClient();
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Users
    const { data: usersList, isLoading: isLoadingUsers, error: usersError } = useQuery({
        queryKey: ['admin-users-list'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.users.list);
            return response.data.results || response.data;
        },
    });

    // Fetch Bookings
    const { data: bookingsList, isLoading: isLoadingBookings } = useQuery({
        queryKey: ['admin-all-bookings'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.bookings.list);
            return response.data.results || response.data;
        },
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await axios.delete(API_ENDPOINTS.users.delete(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users-list']);
            toast.success('User deleted successfully');
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || 'Failed to delete user');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            await axios.patch(API_ENDPOINTS.users.update(id), data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users-list']);
            setEditingUser(null);
            toast.success('User updated successfully');
        },
        onError: (err) => {
            const msg = err.response?.data ? Object.values(err.response.data).flat().join(', ') : 'Failed to update user';
            toast.error(msg);
        }
    });

    // Handlers
    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleEditSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        updateMutation.mutate({
            id: editingUser.id,
            data: {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                email: formData.get('email'),
                username: formData.get('username')
            }
        });
    };

    // Merge Data - Filter to show only regular patients (not doctors or admins)
    const users = React.useMemo(() => {
        if (!usersList) return [];

        // Filter to only include regular patients:
        // - Must NOT be staff (doctors are is_staff=true)
        // - Must NOT be superuser (admins are is_superuser=true)
        // - Role should be 'patient' or undefined (regular users)
        let result = usersList
            .filter(user => !user.is_staff && !user.is_superuser && user.role !== 'doctor')
            .map(user => {
                const userBookings = bookingsList?.filter(b => b.user === user.id) || [];
                return {
                    id: user.id,
                    name: (user.first_name || user.last_name) ? `${user.first_name} ${user.last_name}`.trim() : user.username,
                    rawName: { first: user.first_name || '', last: user.last_name || '' },
                    username: user.username,
                    email: user.email,
                    totalBookings: userBookings.length,
                    pendingBookings: userBookings.filter(b => b.status === 'pending').length,
                    joined: user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A',
                };
            });

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(lowerTerm) ||
                user.email.toLowerCase().includes(lowerTerm) ||
                user.username.toLowerCase().includes(lowerTerm)
            );
        }
        return result;
    }, [usersList, bookingsList, searchTerm]);

    if (isLoadingUsers || isLoadingBookings) return <AdminLayout><Loading /></AdminLayout>;

    if (usersError) return (
        <AdminLayout>
            <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
                <h3>Error Loading Users</h3>
                <p>{usersError.message}</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>Manage Patients</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>View and manage patient accounts</p>
                </div>
                <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 600 }}>
                    Total Patients: {users.length}
                </div>
            </div>

            {/* Search Filter */}
            <div style={{ marginBottom: '2rem', maxWidth: '400px' }}>
                <div style={{ position: 'relative' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem 0.875rem 2.5rem',
                            borderRadius: '0.75rem',
                            border: '1px solid #e2e8f0',
                            outline: 'none',
                            fontSize: '0.9375rem',
                            backgroundColor: 'white',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Patient</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Bookings</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Joined</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{user.email}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.totalBookings} Bookings</div>
                                        {user.pendingBookings > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{user.pendingBookings} pending</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>{user.joined}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button onClick={() => setEditingUser(user)} style={{ marginRight: '0.5rem', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }} title="Edit">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button onClick={() => handleDelete(user.id, user.name)} style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', color: '#1e293b' }}>Edit User</h3>
                        <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Username</label>
                                <input name="username" defaultValue={editingUser.username} className="form-input" style={{ width: '100%' }} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Email</label>
                                <input name="email" type="email" defaultValue={editingUser.email} className="form-input" style={{ width: '100%' }} required />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>First Name</label>
                                    <input name="first_name" defaultValue={editingUser.rawName.first} className="form-input" style={{ width: '100%' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Last Name</label>
                                    <input name="last_name" defaultValue={editingUser.rawName.last} className="form-input" style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setEditingUser(null)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>Cancel</button>
                                <button type="submit" disabled={updateMutation.isPending} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
