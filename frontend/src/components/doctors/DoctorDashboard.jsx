import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import StatCard from '../common/StatCard';
import Loading from '../common/Loading';
import { toast } from 'react-toastify';

const DoctorDashboard = ({ stats }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'appointments', label: 'Appointments', icon: '📅' },
        { id: 'schedule', label: 'My Schedule', icon: '⏰' },
        { id: 'leaves', label: 'Manage Leaves', icon: '🏖️' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '80vh', gap: '2rem', paddingBottom: '2rem' }}>

            {/* SIDEBAR NAVIGATION */}
            <div style={{
                width: '280px',
                flexShrink: 0,
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                height: 'fit-content',
                position: 'sticky',
                top: '6rem' // Below navbar
            }}>
                <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>Doctor's Portal</h2>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Dashboard & Tools</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                backgroundColor: activeTab === tab.id ? '#eff6ff' : 'transparent',
                                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                                border: 'none',
                                borderRadius: '1rem',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {activeTab === tab.id && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    height: '50%',
                                    width: '4px',
                                    backgroundColor: '#2563eb',
                                    borderTopRightRadius: '4px',
                                    borderBottomRightRadius: '4px'
                                }}></div>
                            )}
                            <span style={{ fontSize: '1.25rem', width: '24px', textAlign: 'center' }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ flex: 1 }}>
                {/* Welcome Card */}
                <div className="card" style={{
                    marginBottom: '2rem',
                    padding: '2.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    borderRadius: '1.5rem',
                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>Welcome, Dr. {stats.doctor_name}</h1>
                        <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '1.1rem', fontWeight: 500 }}>
                            Department of {stats.department}
                        </p>
                    </div>
                    <div style={{ fontSize: '4rem', opacity: 0.2 }}>
                        👨‍⚕️
                    </div>
                </div>

                {/* Tab Content with Animation */}
                <div style={{ animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    {activeTab === 'overview' && <Overview stats={stats} />}
                    {activeTab === 'appointments' && <AppointmentsList />}
                    {activeTab === 'schedule' && <ScheduleManager />}
                    {activeTab === 'leaves' && <LeaveManager />}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

// --- Sub-components (Unchanged Logic, styling tweaks optional) ---

const Overview = ({ stats }) => (
    <div className="grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
    }}>
        <StatCard title="Total Appointments" value={stats.total_appointments} icon="📅" color="primary" />
        <StatCard title="Pending Requests" value={stats.pending_appointments} icon="⏳" color="warning" />
        <StatCard title="Confirmed" value={stats.accepted_appointments} icon="✅" color="success" />
        <StatCard title="Today's Schedule" value={stats.today_appointments} icon="📆" color="info" />
    </div>
);

const AppointmentsList = () => {
    const { data: bookings, isLoading } = useQuery({
        queryKey: ['doctor-bookings'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.bookings.list);
            return response.data.results || response.data;
        }
    });

    if (isLoading) return <Loading />;

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Upcoming Appointments</h3>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{bookings?.length || 0} Total</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Symptoms</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings?.map(booking => (
                        <tr key={booking.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                            <td style={{ padding: '1.25rem 1rem' }}>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{booking.p_name || booking.user_name || 'Patient'}</div>
                            </td>
                            <td style={{ padding: '1.25rem 1rem' }}>
                                <div style={{ color: '#1e293b', fontWeight: 500 }}>{booking.booking_date}</div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{booking.appointment_time}</div>
                            </td>
                            <td style={{ padding: '1.25rem 1rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    backgroundColor: booking.status === 'accepted' ? '#dcfce7' : booking.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                                    color: booking.status === 'accepted' ? '#166534' : booking.status === 'cancelled' ? '#991b1b' : '#92400e',
                                }}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                            </td>
                            <td style={{ padding: '1.25rem 1rem', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {booking.symptoms || '-'}
                            </td>
                        </tr>
                    ))}
                    {bookings?.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📅</div>
                                <p style={{ margin: 0 }}>No appointments found.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const ScheduleManager = () => {
    const queryClient = useQueryClient();
    const DAYS = [
        { id: 0, name: 'Monday' },
        { id: 1, name: 'Tuesday' },
        { id: 2, name: 'Wednesday' },
        { id: 3, name: 'Thursday' },
        { id: 4, name: 'Friday' },
        { id: 5, name: 'Saturday' },
        { id: 6, name: 'Sunday' },
    ];

    const { data: availabilities, isLoading } = useQuery({
        queryKey: ['doctor-availability'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.doctorAvailability.list);
            return response.data.results || response.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async (availabilityData) => {
            const existing = availabilities?.find(a => a.day === availabilityData.day);
            if (existing) {
                return axios.put(API_ENDPOINTS.doctorAvailability.update(existing.id), availabilityData);
            } else {
                return axios.post(API_ENDPOINTS.doctorAvailability.create, availabilityData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['doctor-availability']);
            toast.success('Schedule updated successfully');
        },
        onError: () => toast.error('Failed to update schedule')
    });

    const handleSaveDay = (dayId, start, end) => {
        if (!start || !end) {
            toast.warning('Please select both start and end times');
            return;
        }
        mutation.mutate({ day: dayId, start_time: start, end_time: end });
    };

    if (isLoading) return <Loading />;

    return (
        <div className="card" style={{ borderRadius: '1.5rem', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: '#1e293b' }}>Weekly Availability</h3>
            <p style={{ marginBottom: '2rem', color: '#64748b', maxWidth: '600px', lineHeight: '1.5' }}>
                Set your working hours for each day. The system will automatically generate 20-minute slots within these hours.
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {DAYS.map(day => {
                    const avail = availabilities?.find(a => a.day === day.id);
                    const startVal = avail?.start_time ? avail.start_time.substring(0, 5) : '';
                    const endVal = avail?.end_time ? avail.end_time.substring(0, 5) : '';

                    return (
                        <div key={day.id} style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(100px, 1fr) 1fr 1fr auto',
                            gap: '1.5rem',
                            alignItems: 'center',
                            padding: '1.25rem',
                            backgroundColor: avail ? '#f0f9ff' : 'white',
                            border: avail ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: avail ? '#2563eb' : '#cbd5e1' }}></span>
                                {day.name}
                            </div>
                            <input
                                type="time"
                                defaultValue={startVal}
                                id={`start-${day.id}`}
                                className="form-input"
                                style={{ borderColor: avail ? '#bae6fd' : '#e2e8f0' }}
                            />
                            <input
                                type="time"
                                defaultValue={endVal}
                                id={`end-${day.id}`}
                                className="form-input"
                                style={{ borderColor: avail ? '#bae6fd' : '#e2e8f0' }}
                            />
                            <button
                                onClick={() => {
                                    const start = document.getElementById(`start-${day.id}`).value;
                                    const end = document.getElementById(`end-${day.id}`).value;
                                    handleSaveDay(day.id, start, end);
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                                }}
                            >
                                Save
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const LeaveManager = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ date: '', reason: '' });

    const { data: leaves, isLoading } = useQuery({
        queryKey: ['doctor-leaves'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.doctorLeaves.list);
            return response.data.results || response.data;
        }
    });

    const createLeave = useMutation({
        mutationFn: async (data) => axios.post(API_ENDPOINTS.doctorLeaves.create, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['doctor-leaves']);
            setShowForm(false);
            setFormData({ date: '', reason: '' });
            toast.success('Leave marked successfully');
        },
        onError: (err) => toast.error(err.response?.data?.detail || 'Failed to mark leave')
    });

    const deleteLeave = useMutation({
        mutationFn: async (id) => axios.delete(API_ENDPOINTS.doctorLeaves.delete(id)),
        onSuccess: () => {
            queryClient.invalidateQueries(['doctor-leaves']);
            toast.success('Leave removed successfully');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createLeave.mutate(formData);
    };

    if (isLoading) return <Loading />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Leave Management</h3>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Plan your time off</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: showForm ? '#ef4444' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                >
                    <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i>
                    {showForm ? 'Cancel' : 'Add New Leave'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid #3b82f6', padding: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Select Date</label>
                            <input
                                type="date"
                                className="form-input"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ flex: '2 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Reason (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Vacation, Personal, Conference"
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={createLeave.isPending}
                            style={{
                                padding: '0.75rem 2rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                height: '42px'
                            }}
                        >
                            {createLeave.isPending ? 'Saving...' : 'Confirm'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {leaves?.map(leave => (
                    <div key={leave.id} style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderLeft: '4px solid #f59e0b',
                        transition: 'transform 0.2s',
                        cursor: 'default'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>
                                {new Date(leave.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div style={{ color: '#64748b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🏖️</span>
                                {leave.reason || 'No reason provided'}
                            </div>
                        </div>
                        <button
                            onClick={() => deleteLeave.mutate(leave.id)}
                            style={{
                                color: '#94a3b8',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.75rem',
                                fontSize: '1.1rem',
                                transition: 'color 0.2s'
                            }}
                            title="Cancel Leave"
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                        >
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                ))}
            </div>
            {leaves?.length === 0 && !showForm && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '1.5rem', border: '2px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>✨</div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No leaves scheduled.</p>
                    <p style={{ fontSize: '0.875rem' }}>Your calendar is clear!</p>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
