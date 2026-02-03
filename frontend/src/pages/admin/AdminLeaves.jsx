import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';

const AdminLeaves = () => {
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all doctor leaves
    const { data: leaves, isLoading } = useQuery({
        queryKey: ['admin-leaves'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.doctorLeaves.list);
            return response.data.results || response.data;
        },
    });

    // Delete leave mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await axios.delete(API_ENDPOINTS.doctorLeaves.delete(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-leaves']);
            toast.success('Leave deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete leave');
        }
    });

    if (isLoading) return <AdminLayout><Loading /></AdminLayout>;

    // Filter leaves
    const filteredLeaves = leaves?.filter(leave => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Use 'date' field (single date per leave)
        const leaveDate = new Date(leave.date || leave.start_date);

        // Status filter
        let statusMatch = true;
        if (filterStatus === 'upcoming') {
            statusMatch = leaveDate > today;
        } else if (filterStatus === 'active') {
            // Active means today is the leave day
            statusMatch = leaveDate.getTime() === today.getTime();
        } else if (filterStatus === 'past') {
            statusMatch = leaveDate < today;
        }

        // Search filter
        const searchMatch = !searchTerm ||
            leave.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leave.reason?.toLowerCase().includes(searchTerm.toLowerCase());

        return statusMatch && searchMatch;
    }) || [];

    // Get leave status
    const getLeaveStatus = (leave) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leaveDate = new Date(leave.date || leave.start_date);
        leaveDate.setHours(0, 0, 0, 0);

        if (leaveDate.getTime() > today.getTime()) return { label: 'Upcoming', color: '#3b82f6', bg: '#dbeafe' };
        if (leaveDate.getTime() < today.getTime()) return { label: 'Completed', color: '#64748b', bg: '#f1f5f9' };
        return { label: 'On Leave Today', color: '#059669', bg: '#d1fae5' };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Count stats
    const stats = {
        total: leaves?.length || 0,
        upcoming: leaves?.filter(l => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(l.date || l.start_date) > today;
        }).length || 0,
        active: leaves?.filter(l => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const leaveDate = new Date(l.date || l.start_date);
            leaveDate.setHours(0, 0, 0, 0);
            return leaveDate.getTime() === today.getTime();
        }).length || 0,
    };

    return (
        <AdminLayout>
            {/* Header with Add Leave Button */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>
                        Doctor Leaves
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>
                        Manage doctor leave schedules
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => queryClient.invalidateQueries(['admin-leaves'])}
                        style={{
                            padding: '0.875rem 1.25rem',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                        }}
                    >
                        <i className="fas fa-sync-alt"></i>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="fas fa-calendar-alt" style={{ fontSize: '1.25rem', color: '#3b82f6' }}></i>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Leaves</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>{stats.total}</div>
                        </div>
                    </div>
                </div>
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: '#fef3c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="fas fa-clock" style={{ fontSize: '1.25rem', color: '#f59e0b' }}></i>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Upcoming</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>{stats.upcoming}</div>
                        </div>
                    </div>
                </div>
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: '#d1fae5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="fas fa-user-clock" style={{ fontSize: '1.25rem', color: '#059669' }}></i>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Currently On Leave</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>{stats.active}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
                    <i className="fas fa-search" style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                    }}></i>
                    <input
                        type="text"
                        placeholder="Search by doctor name or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            borderRadius: '0.75rem',
                            border: '1px solid #e2e8f0',
                            outline: 'none',
                            fontSize: '0.9375rem',
                            backgroundColor: 'white'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'upcoming', 'active', 'past'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '0.625rem 1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                backgroundColor: filterStatus === status ? '#3b82f6' : '#f1f5f9',
                                color: filterStatus === status ? 'white' : '#64748b',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaves Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
            }}>
                {filteredLeaves.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Doctor</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Leave Date</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Reason</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.map(leave => {
                                const status = getLeaveStatus(leave);
                                return (
                                    <tr key={leave.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#eff6ff',
                                                    color: '#3b82f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700
                                                }}>
                                                    {leave.doctor_name?.charAt(0) || 'D'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                                        Dr. {leave.doctor_name || 'Unknown'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        {leave.department_name || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500, color: '#1e293b' }}>
                                                {formatDate(leave.date)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', maxWidth: '250px' }}>
                                            <div style={{
                                                color: '#475569',
                                                fontSize: '0.875rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {leave.reason || 'No reason provided'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: status.bg,
                                                color: status.color
                                            }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this leave?')) {
                                                        deleteMutation.mutate(leave.id);
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#ef4444'
                                                }}
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <i className="fas fa-calendar-times" style={{ fontSize: '4rem', color: '#e2e8f0', marginBottom: '1rem' }}></i>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                            No Leaves Found
                        </h3>
                        <p style={{ margin: 0, color: '#64748b' }}>
                            {filterStatus !== 'all'
                                ? `No ${filterStatus} leaves at the moment`
                                : 'No doctor leaves have been scheduled yet'}
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminLeaves;
