import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';

const AdminDashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.dashboard.stats);
            return response.data;
        },
    });

    if (isLoading) return <AdminLayout><Loading /></AdminLayout>;

    const statCards = [
        {
            title: 'Total Doctors',
            value: stats?.total_doctors || 0,
            icon: 'fas fa-user-md',
            color: '#3b82f6',
            bgColor: '#dbeafe',
            link: '/admin/doctors'
        },
        {
            title: 'Total Departments',
            value: stats?.total_departments || 0,
            icon: 'fas fa-hospital',
            color: '#8b5cf6',
            bgColor: '#ede9fe',
            link: '/admin/departments'
        },
        {
            title: 'Total Bookings',
            value: stats?.total_bookings || 0,
            icon: 'fas fa-calendar-check',
            color: '#10b981',
            bgColor: '#d1fae5',
            link: '/admin/bookings'
        },
        {
            title: 'Pending Bookings',
            value: stats?.pending_bookings || 0,
            icon: 'fas fa-clock',
            color: '#f59e0b',
            bgColor: '#fef3c7',
            link: '/admin/bookings?status=pending'
        },
        {
            title: 'Total Patients',
            value: stats?.total_patients || 0,
            icon: 'fas fa-users',
            color: '#06b6d4',
            bgColor: '#cffafe',
            link: '/admin/users'
        },
        {
            title: "Today's Appointments",
            value: stats?.today_bookings || 0,
            icon: 'fas fa-calendar-day',
            color: '#ec4899',
            bgColor: '#fce7f3',
            link: '/admin/bookings?date=today'
        },
        {
            title: 'Unread Messages',
            value: stats?.unread_contacts || 0,
            icon: 'fas fa-envelope',
            color: '#ef4444',
            bgColor: '#fee2e2',
            link: '/admin/contacts'
        },
        {
            title: 'Accepted Bookings',
            value: stats?.accepted_bookings || 0,
            icon: 'fas fa-check-circle',
            color: '#059669',
            bgColor: '#d1fae5',
            link: '/admin/bookings?status=accepted'
        },
    ];

    const quickActions = [
        { label: 'Add New Doctor', icon: 'fas fa-plus', link: '/admin/doctors/new', color: '#3b82f6' },
        { label: 'Add Department', icon: 'fas fa-plus', link: '/admin/departments/new', color: '#8b5cf6' },
        { label: 'View All Bookings', icon: 'fas fa-list', link: '/admin/bookings', color: '#10b981' },
        { label: 'Manage Users', icon: 'fas fa-users-cog', link: '/admin/users', color: '#f59e0b' },
    ];

    return (
        <AdminLayout>
            {/* Welcome Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem',
                padding: '2rem',
                color: 'white',
                marginBottom: '2rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 800 }}>
                    Welcome back, Administrator! 👋
                </h2>
                <p style={{ margin: 0, fontSize: '1.125rem', opacity: 0.9 }}>
                    Here's what's happening with your hospital today
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {statCards.map((stat, index) => (
                    <Link
                        key={index}
                        to={stat.link}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            border: '2px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = stat.color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '1rem',
                            backgroundColor: stat.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <i className={stat.icon} style={{ fontSize: '1.75rem', color: stat.color }}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 500 }}>
                                {stat.title}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>
                                {stat.value}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '2rem'
            }}>
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                    <i className="fas fa-bolt" style={{ marginRight: '0.5rem', color: '#f59e0b' }}></i>
                    Quick Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            to={action.link}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.5rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '0.75rem',
                                textDecoration: 'none',
                                color: '#1e293b',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                border: '2px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = action.color;
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#1e293b';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <i className={action.icon} style={{ fontSize: '1.25rem' }}></i>
                            <span>{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* System Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                        <i className="fas fa-info-circle" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
                        System Status
                    </h4>
                    <div style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>API Status:</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>
                                <i className="fas fa-circle" style={{ fontSize: '0.5rem', marginRight: '0.5rem' }}></i>
                                Online
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Database:</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>
                                <i className="fas fa-circle" style={{ fontSize: '0.5rem', marginRight: '0.5rem' }}></i>
                                Connected
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Last Updated:</span>
                            <span style={{ fontWeight: 600 }}>Just now</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                        <i className="fas fa-chart-line" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                        Need Help?
                    </h4>
                    <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9375rem' }}>
                        Access documentation and support resources
                    </p>
                    <button style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9375rem',
                        transition: 'background-color 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        <i className="fas fa-book" style={{ marginRight: '0.5rem' }}></i>
                        View Documentation
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
