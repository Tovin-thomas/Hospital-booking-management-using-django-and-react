import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';
import DoctorDashboard from '../components/doctors/DoctorDashboard';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.dashboard.stats);
            return response.data;
        }
    });

    if (isLoading) return <Loading />;
    if (error) return <div className="error-message">Error loading dashboard: {error.message}</div>;

    return (
        <div className="container">
            {stats.role === 'doctor' ? (
                <DoctorDashboard stats={stats} />
            ) : (
                <PatientDashboard stats={stats} />
            )}
        </div>
    );
};

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

export default Dashboard;
