import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';

const Dashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.dashboard.stats);
            return response.data;
        },
    });

    if (isLoading) return <Loading />;

    return (
        <div style={{ padding: '3rem 0', backgroundColor: 'var(--color-gray-50)', minHeight: 'calc(100vh - 200px)' }}>
            <div className="container">
                <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>

                {stats?.role === 'admin' && <AdminDashboard stats={stats} />}
                {stats?.role === 'doctor' && <DoctorDashboard stats={stats} />}
                {stats?.role === 'patient' && <PatientDashboard stats={stats} />}
            </div>
        </div>
    );
};

const AdminDashboard = ({ stats }) => (
    <div className="grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    }}>
        <StatCard title="Total Doctors" value={stats.total_doctors} icon="👨‍⚕️" color="primary" />
        <StatCard title="Total Departments" value={stats.total_departments} icon="🏥" color="secondary" />
        <StatCard title="Total Bookings" value={stats.total_bookings} icon="📅" color="primary" />
        <StatCard title="Pending Bookings" value={stats.pending_bookings} icon="⏰" color="warning" />
        <StatCard title="Accepted Bookings" value={stats.accepted_bookings} icon="✅" color="success" />
        <StatCard title="Total Patients" value={stats.total_patients} icon="👥" color="primary" />
        <StatCard title="Today's Bookings" value={stats.today_bookings} icon="📆" color="info" />
        <StatCard title="Unread Messages" value={stats.unread_contacts} icon="📧" color="danger" />
    </div>
);

const DoctorDashboard = ({ stats }) => (
    <>
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Welcome, {stats.doctor_name}!</h2>
            <p style={{ color: 'var(--color-gray-600)' }}>Department: {stats.department}</p>
        </div>

        <div className="grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
        }}>
            <StatCard title="Total Appointments" value={stats.total_appointments} icon="📅" color="primary" />
            <StatCard title="Pending" value={stats.pending_appointments} icon="⏰" color="warning" />
            <StatCard title="Accepted" value={stats.accepted_appointments} icon="✅" color="success" />
            <StatCard title="Today's Appointments" value={stats.today_appointments} icon="📆" color="info" />
            <StatCard title="Upcoming" value={stats.upcoming_appointments} icon="🔜" color="primary" />
        </div>
    </>
);

const PatientDashboard = ({ stats }) => (
    <div className="grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    }}>
        <StatCard title="Total Bookings" value={stats.total_bookings} icon="📅" color="primary" />
        <StatCard title="Pending" value={stats.pending_bookings} icon="⏰" color="warning" />
        <StatCard title="Accepted" value={stats.accepted_bookings} icon="✅" color="success" />
        <StatCard title="Upcoming" value={stats.upcoming_bookings} icon="🔜" color="info" />
    </div>
);

const StatCard = ({ title, value, icon, color = 'primary' }) => {
    const colorMap = {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-error)',
        info: 'var(--color-info)',
    };

    return (
        <div className="card" style={{
            borderLeft: `4px solid ${colorMap[color]}`,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        {title}
                    </p>
                    <h2 style={{ fontSize: '2rem', marginBottom: 0, color: colorMap[color] }}>
                        {value}
                    </h2>
                </div>
                <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
