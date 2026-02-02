import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';
import DoctorDashboard from '../components/doctors/DoctorDashboard';

const Dashboard = () => {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.dashboard.stats);
            return response.data;
        }
    });

    if (isLoading) return <Loading />;
    if (error) return <div className="error-message">Error loading dashboard: {error.message}</div>;

    // Only doctors should see the doctor dashboard
    // Regular patients/users won't reach here due to route protection
    if (stats.role !== 'doctor') {
        return <div className="error-message">Unauthorized access</div>;
    }

    return <DoctorDashboard stats={stats} />;
};

export default Dashboard;
