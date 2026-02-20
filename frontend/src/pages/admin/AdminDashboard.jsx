import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';

// ── Add Admin Modal ──────────────────────────────────────────────
const AddAdminModal = ({ onClose, onSuccess }) => {
    const [tab, setTab] = useState('promote'); // 'promote' | 'create'
    const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = tab === 'promote'
                ? { action_type: 'promote', username: form.username }
                : { action_type: 'create', ...form };

            const response = await axios.post(API_ENDPOINTS.admins.create, payload);
            toast.success(response.data.message);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '1.25rem', padding: '2rem',
                width: '100%', maxWidth: '480px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                        <i className="fas fa-user-plus" style={{ marginRight: '0.5rem', color: '#8b5cf6' }} />
                        Add Admin
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>
                        <i className="fas fa-times" />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '0.75rem', padding: '0.25rem' }}>
                    {[
                        { key: 'promote', label: 'Promote Existing User', icon: 'fas fa-user-check' },
                        { key: 'create', label: 'Create New Admin', icon: 'fas fa-user-plus' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            flex: 1, padding: '0.625rem 0.75rem', border: 'none', borderRadius: '0.5rem',
                            fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                            backgroundColor: tab === t.key ? 'white' : 'transparent',
                            color: tab === t.key ? '#8b5cf6' : '#64748b',
                            boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}>
                            <i className={t.icon} style={{ marginRight: '0.4rem' }} />
                            {t.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {tab === 'promote' ? (
                        <>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', marginTop: 0 }}>
                                Enter the <strong>username</strong> of an existing registered user to grant them admin access.
                            </p>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Username *
                                </label>
                                <input
                                    type="text" required
                                    value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                    placeholder="e.g. john_doe"
                                    style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '0.9375rem', boxSizing: 'border-box', outline: 'none' }}
                                    onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', marginTop: 0 }}>
                                Create a brand new admin account directly.
                            </p>
                            {[
                                { key: 'username', label: 'Username *', placeholder: 'e.g. admin2', required: true },
                                { key: 'email', label: 'Email', placeholder: 'admin@hospital.com', required: false },
                                { key: 'first_name', label: 'First Name', placeholder: 'John', required: false },
                                { key: 'last_name', label: 'Last Name', placeholder: 'Doe', required: false },
                                { key: 'password', label: 'Password *', placeholder: '••••••••', required: true, type: 'password' },
                            ].map(field => (
                                <div key={field.key} style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type || 'text'}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        value={form[field.key]}
                                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '0.9375rem', boxSizing: 'border-box', outline: 'none' }}
                                        onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '0.875rem', border: '2px solid #e2e8f0', borderRadius: '0.75rem',
                            fontWeight: 600, cursor: 'pointer', backgroundColor: 'white', color: '#64748b'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{
                            flex: 1, padding: '0.875rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                            border: 'none', borderRadius: '0.75rem', color: 'white',
                            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                        }}>
                            {loading
                                ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }} />Processing...</>
                                : tab === 'promote' ? '✓ Grant Admin Access' : '+ Create Admin'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main Dashboard ───────────────────────────────────────────────
const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);

    const isMainAdmin = currentUser?.username === 'admintovin';

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.dashboard.stats);
            return response.data;
        },
    });

    const { data: adminList = [] } = useQuery({
        queryKey: ['admin-list'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.admins.list);
            return response.data;
        },
    });

    // Remove admin mutation (main admin only)
    const removeMutation = useMutation({
        mutationFn: (id) => axios.post(API_ENDPOINTS.admins.remove(id)),
        onSuccess: (_, id) => {
            toast.success('Admin access removed.');
            queryClient.invalidateQueries({ queryKey: ['admin-list'] });
        },
        onError: (error) => toast.error(error.response?.data?.error || 'Failed to remove admin.'),
    });

    const handleRemove = (admin) => {
        if (window.confirm(`Remove admin access from "${admin.username}"? They will become a regular user.`)) {
            removeMutation.mutate(admin.id);
        }
    };

    if (isLoading) return <AdminLayout><Loading /></AdminLayout>;

    const statCards = [
        { title: 'Total Doctors', value: stats?.total_doctors || 0, icon: 'fas fa-user-md', color: '#3b82f6', bgColor: '#dbeafe', link: '/admin/doctors' },
        { title: 'Total Departments', value: stats?.total_departments || 0, icon: 'fas fa-hospital', color: '#8b5cf6', bgColor: '#ede9fe', link: '/admin/departments' },
        { title: 'Total Bookings', value: stats?.total_bookings || 0, icon: 'fas fa-calendar-check', color: '#10b981', bgColor: '#d1fae5', link: '/admin/bookings' },
        { title: 'Pending Bookings', value: stats?.pending_bookings || 0, icon: 'fas fa-clock', color: '#f59e0b', bgColor: '#fef3c7', link: '/admin/bookings?status=pending' },
        { title: 'Total Patients', value: stats?.total_patients || 0, icon: 'fas fa-users', color: '#06b6d4', bgColor: '#cffafe', link: '/admin/users' },
        { title: "Today's Appointments", value: stats?.today_bookings || 0, icon: 'fas fa-calendar-day', color: '#ec4899', bgColor: '#fce7f3', link: '/admin/bookings?date=today' },
        { title: 'Unread Messages', value: stats?.unread_contacts || 0, icon: 'fas fa-envelope', color: '#ef4444', bgColor: '#fee2e2', link: '/admin/contacts' },
        { title: 'Accepted Bookings', value: stats?.accepted_bookings || 0, icon: 'fas fa-check-circle', color: '#059669', bgColor: '#d1fae5', link: '/admin/bookings?status=accepted' },
    ];

    return (
        <AdminLayout>
            {showAddModal && (
                <AddAdminModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-list'] })}
                />
            )}

            {/* Welcome */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem', padding: '2rem', color: 'white',
                marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 800 }}>
                    Welcome back, {isMainAdmin ? '👑 admintovin' : 'Administrator'}!
                </h2>
                <p style={{ margin: 0, fontSize: '1.125rem', opacity: 0.9 }}>
                    Here's what's happening with your hospital today
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem', marginBottom: '2rem'
            }}>
                {statCards.map((stat, index) => (
                    <Link key={index} to={stat.link} style={{
                        backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: '1.5rem',
                        transition: 'transform 0.2s, box-shadow 0.2s', border: '2px solid transparent'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = stat.color; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                        <div style={{ width: '64px', height: '64px', borderRadius: '1rem', backgroundColor: stat.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className={stat.icon} style={{ fontSize: '1.75rem', color: stat.color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500 }}>{stat.title}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Admins Panel */}
            <div style={{
                backgroundColor: 'white', borderRadius: '1rem', padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                        <i className="fas fa-user-shield" style={{ marginRight: '0.5rem', color: '#8b5cf6' }} />
                        Administrators ({adminList.length})
                    </h3>
                    {/* Only main admin can add admins */}
                    {isMainAdmin && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{
                                padding: '0.625rem 1.25rem',
                                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                color: 'white', border: 'none', borderRadius: '0.75rem',
                                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <i className="fas fa-user-plus" />
                            Add Admin
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {adminList.map((admin) => (
                        <div key={admin.id} style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem',
                            border: admin.is_main_admin ? '2px solid #8b5cf6' : '1px solid #e2e8f0'
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '50%',
                                background: admin.is_main_admin
                                    ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 800, fontSize: '1.125rem', flexShrink: 0
                            }}>
                                {admin.username[0].toUpperCase()}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {admin.username}
                                    {admin.is_main_admin && (
                                        <span style={{
                                            fontSize: '0.6875rem', fontWeight: 700,
                                            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                            color: 'white', padding: '0.125rem 0.625rem', borderRadius: '999px'
                                        }}>
                                            👑 MAIN ADMIN
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                                    {admin.email || 'No email'}
                                    {admin.last_login && (
                                        <span style={{ marginLeft: '1rem' }}>
                                            Last login: {new Date(admin.last_login).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Joined date */}
                            <div style={{ fontSize: '0.8125rem', color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>
                                Joined {new Date(admin.date_joined).toLocaleDateString()}
                            </div>

                            {/* Remove button — only main admin, not on themselves */}
                            {isMainAdmin && !admin.is_main_admin && (
                                <button
                                    onClick={() => handleRemove(admin)}
                                    disabled={removeMutation.isPending}
                                    title="Remove admin access"
                                    style={{
                                        padding: '0.5rem', backgroundColor: '#fee2e2', color: '#ef4444',
                                        border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                                        fontSize: '0.875rem', flexShrink: 0, transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fecaca'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                >
                                    <i className="fas fa-user-minus" />
                                </button>
                            )}
                        </div>
                    ))}
                    {adminList.length === 0 && (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>No admins found.</p>
                    )}
                </div>

                {!isMainAdmin && (
                    <p style={{ margin: '1rem 0 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
                        <i className="fas fa-info-circle" style={{ marginRight: '0.4rem' }} />
                        Only admintovin can add or remove administrators.
                    </p>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                    <i className="fas fa-bolt" style={{ marginRight: '0.5rem', color: '#f59e0b' }} />
                    Quick Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Add New Doctor', icon: 'fas fa-plus', link: '/admin/doctors', color: '#3b82f6' },
                        { label: 'Add Department', icon: 'fas fa-plus', link: '/admin/departments', color: '#8b5cf6' },
                        { label: 'View All Bookings', icon: 'fas fa-list', link: '/admin/bookings', color: '#10b981' },
                        { label: 'Manage Users', icon: 'fas fa-users-cog', link: '/admin/users', color: '#f59e0b' },
                    ].map((action, index) => (
                        <Link key={index} to={action.link} style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem',
                            textDecoration: 'none', color: '#1e293b', fontWeight: 600, transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = action.color; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#1e293b'; }}
                        >
                            <i className={action.icon} style={{ fontSize: '1.25rem' }} />
                            <span>{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
