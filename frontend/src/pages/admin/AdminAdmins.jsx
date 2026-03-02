import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';

// All modules available in the admin panel
const ALL_MODULES = [
    { key: 'doctors', label: 'Doctors', icon: 'fas fa-user-md', color: '#3b82f6', desc: 'Manage doctors, create & edit profiles' },
    { key: 'departments', label: 'Departments', icon: 'fas fa-hospital', color: '#10b981', desc: 'Add & manage hospital departments' },
    { key: 'bookings', label: 'Bookings', icon: 'fas fa-calendar-check', color: '#f59e0b', desc: 'View & manage patient appointments' },
    { key: 'leaves', label: 'Doctor Leaves', icon: 'fas fa-calendar-times', color: '#ef4444', desc: 'Manage doctor leave requests' },
    { key: 'users', label: 'Users', icon: 'fas fa-users', color: '#8b5cf6', desc: 'View & manage patient accounts' },
    { key: 'contacts', label: 'Messages', icon: 'fas fa-envelope', color: '#06b6d4', desc: 'View contact messages from users' },
    { key: 'admins', label: 'Manage Admins', icon: 'fas fa-user-shield', color: '#f97316', desc: 'Add & manage administrator accounts' },
];

// ── Permissions Modal ─────────────────────────────────────────────
const PermissionsModal = ({ admin, onClose, onSave }) => {
    const [selected, setSelected] = useState(admin.allowed_modules || []);
    const [saving, setSaving] = useState(false);

    const toggleModule = (key) => {
        setSelected(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.post(API_ENDPOINTS.admins.permissions(admin.id), {
                allowed_modules: selected,
            });
            toast.success(response.data.message);
            onSave(admin.id, selected);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update permissions.');
        } finally {
            setSaving(false);
        }
    };

    const selectAll = () => setSelected(ALL_MODULES.map(m => m.key));
    const clearAll = () => setSelected([]);

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '1.25rem', padding: '2rem',
                width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                            <i className="fas fa-shield-alt" style={{ marginRight: '0.5rem', color: '#8b5cf6' }} />
                            Set Permissions
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                            Choose which sections <strong>{admin.username}</strong> can access
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}>
                        <i className="fas fa-times" />
                    </button>
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <button onClick={selectAll} style={{
                        padding: '0.4rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem',
                        background: 'white', color: '#475569', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                        <i className="fas fa-check-double" style={{ marginRight: '0.35rem' }} />
                        Select All
                    </button>
                    <button onClick={clearAll} style={{
                        padding: '0.4rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem',
                        background: 'white', color: '#475569', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                        <i className="fas fa-times" style={{ marginRight: '0.35rem' }} />
                        Clear All
                    </button>
                    <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                        {selected.length} / {ALL_MODULES.length} selected
                    </span>
                </div>

                {/* Module checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                    {ALL_MODULES.map(mod => {
                        const checked = selected.includes(mod.key);
                        return (
                            <label key={mod.key} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '0.875rem 1rem', borderRadius: '0.75rem', cursor: 'pointer',
                                border: `2px solid ${checked ? mod.color : '#e2e8f0'}`,
                                backgroundColor: checked ? `${mod.color}08` : 'white',
                                transition: 'all 0.15s'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleModule(mod.key)}
                                    style={{ width: '18px', height: '18px', accentColor: mod.color, cursor: 'pointer', flexShrink: 0 }}
                                />
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '0.625rem', flexShrink: 0,
                                    backgroundColor: `${mod.color}18`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className={mod.icon} style={{ color: mod.color, fontSize: '1rem' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9375rem' }}>{mod.label}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>{mod.desc}</div>
                                </div>
                                {checked && (
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 700, color: 'white',
                                        backgroundColor: mod.color, padding: '0.175rem 0.5rem',
                                        borderRadius: '999px', flexShrink: 0
                                    }}>✓ ON</span>
                                )}
                            </label>
                        );
                    })}
                </div>

                {selected.length === 0 && (
                    <div style={{
                        backgroundColor: '#fef3c7', border: '1px solid #fcd34d',
                        borderRadius: '0.75rem', padding: '0.75rem 1rem',
                        fontSize: '0.875rem', color: '#92400e', marginBottom: '1.25rem',
                        display: 'flex', gap: '0.5rem', alignItems: 'center'
                    }}>
                        <i className="fas fa-exclamation-triangle" />
                        No modules selected — this admin will see only the Dashboard.
                    </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '0.875rem', border: '2px solid #e2e8f0', borderRadius: '0.75rem',
                        fontWeight: 600, cursor: 'pointer', background: 'white', color: '#64748b', fontSize: '0.9375rem'
                    }}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{
                        flex: 2, padding: '0.875rem',
                        background: saving ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        border: 'none', borderRadius: '0.75rem', color: 'white',
                        fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9375rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}>
                        {saving ? <><i className="fas fa-spinner fa-spin" />Saving...</> : <><i className="fas fa-save" />Save Permissions</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

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
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                        <i className="fas fa-user-plus" style={{ marginRight: '0.5rem', color: '#8b5cf6' }} />
                        Add New Admin
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

// ── Main Admin Management Page ────────────────────────────────────
const AdminAdmins = () => {
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [permissionsTarget, setPermissionsTarget] = useState(null); // admin object
    const { user } = useAuth();

    // Fetch dashboard stats — the server tells us if we are the main admin.
    const { data: stats } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.dashboard.stats);
            return response.data;
        },
        enabled: !!user,
        retry: 2,
        refetchOnMount: true,
    });

    const isMainAdmin = stats?.is_main_admin === true;

    const { data: adminList = [], isLoading } = useQuery({
        queryKey: ['admin-list'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.admins.list);
            return response.data;
        },
        enabled: !!user,
        retry: 2,
        refetchOnMount: true,
    });

    const removeMutation = useMutation({
        mutationFn: (id) => axios.post(API_ENDPOINTS.admins.remove(id)),
        onSuccess: () => {
            toast.success('Admin account permanently deleted.');
            queryClient.invalidateQueries({ queryKey: ['admin-list'] });
        },
        onError: (error) => toast.error(error.response?.data?.error || 'Failed to delete admin.'),
    });

    const handleRemove = (admin) => {
        if (window.confirm(`⚠️ Permanently DELETE admin account "${admin.username}"?\n\nThis will completely remove them from the database. This action CANNOT be undone.`)) {
            removeMutation.mutate(admin.id);
        }
    };

    // Optimistically update allowed_modules locally after saving permissions
    const handlePermissionsSaved = (adminId, modules) => {
        queryClient.setQueryData(['admin-list'], (old) =>
            old?.map(a => a.id === adminId ? { ...a, allowed_modules: modules } : a)
        );
    };

    if (isLoading) return <Loading text="Loading admins..." />;

    return (
        <>
            {showAddModal && (
                <AddAdminModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-list'] })}
                />
            )}
            {permissionsTarget && (
                <PermissionsModal
                    admin={permissionsTarget}
                    onClose={() => setPermissionsTarget(null)}
                    onSave={handlePermissionsSaved}
                />
            )}

            {/* Header Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                borderRadius: '1rem', padding: '2rem', color: 'white',
                marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(139,92,246,0.3)'
            }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>
                    <i className="fas fa-user-shield" style={{ marginRight: '0.75rem' }} />
                    Admin Management
                </h2>
                <p style={{ margin: 0, opacity: 0.9 }}>
                    {isMainAdmin
                        ? 'As the main administrator, you can add admins and control which sections each admin can access.'
                        : 'View all administrators. Only the main administrator can manage admins.'}
                </p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '0.75rem', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-users-cog" style={{ fontSize: '1.5rem', color: '#8b5cf6' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Admins</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{adminList.length}</div>
                    </div>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '0.75rem', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-crown" style={{ fontSize: '1.5rem', color: '#d97706' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Main Admin</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                            {adminList.find(a => a.is_main_admin)?.username || 'Main Administrator'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin List */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                        <i className="fas fa-list" style={{ marginRight: '0.5rem', color: '#8b5cf6' }} />
                        All Administrators ({adminList.length})
                    </h3>
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

                {adminList.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>No admins found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {adminList.map((admin) => {
                            const isMain = admin.is_main_admin;
                            // "null" means unrestricted (main admin or legacy); array means restricted
                            const hasModules = !isMain && Array.isArray(admin.allowed_modules);
                            const moduleCount = hasModules ? admin.allowed_modules.length : null;

                            return (
                                <div key={admin.id} style={{
                                    padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.875rem',
                                    border: isMain ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                                    transition: 'box-shadow 0.2s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                            background: isMain
                                                ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                                                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 800, fontSize: '1.25rem'
                                        }}>
                                            {admin.username[0].toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {admin.username}
                                                {isMain && (
                                                    <span style={{
                                                        fontSize: '0.6875rem', fontWeight: 700,
                                                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                                        color: 'white', padding: '0.125rem 0.625rem', borderRadius: '999px'
                                                    }}>
                                                        👑 MAIN ADMIN
                                                    </span>
                                                )}
                                                {!isMain && (
                                                    <span style={{
                                                        fontSize: '0.6875rem', fontWeight: 700,
                                                        backgroundColor: moduleCount === 0 ? '#fef3c7' : '#dbeafe',
                                                        color: moduleCount === 0 ? '#92400e' : '#1d4ed8',
                                                        padding: '0.125rem 0.625rem', borderRadius: '999px'
                                                    }}>
                                                        {moduleCount === 0
                                                            ? '⚠️ No Access'
                                                            : moduleCount === ALL_MODULES.length
                                                                ? '✓ Full Access'
                                                                : `${moduleCount} Module${moduleCount !== 1 ? 's' : ''}`}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.2rem' }}>
                                                <i className="fas fa-envelope" style={{ marginRight: '0.4rem', fontSize: '0.7rem' }} />
                                                {admin.email || 'No email set'}
                                                {admin.last_login && (
                                                    <span style={{ marginLeft: '1rem' }}>
                                                        <i className="fas fa-clock" style={{ marginRight: '0.4rem', fontSize: '0.7rem' }} />
                                                        Last login: {new Date(admin.last_login).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Joined date */}
                                        <div style={{ fontSize: '0.8125rem', color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>
                                            <i className="fas fa-calendar-alt" style={{ marginRight: '0.3rem', fontSize: '0.7rem' }} />
                                            Joined {new Date(admin.date_joined).toLocaleDateString()}
                                        </div>

                                        {/* Action buttons — only main admin can modify */}
                                        {isMainAdmin && !isMain && (
                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => setPermissionsTarget(admin)}
                                                    title="Manage section permissions"
                                                    style={{
                                                        padding: '0.5rem 0.875rem', backgroundColor: '#ede9fe', color: '#7c3aed',
                                                        border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                                                        fontSize: '0.8125rem', fontWeight: 600,
                                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ddd6fe'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ede9fe'}
                                                >
                                                    <i className="fas fa-sliders-h" />
                                                    Permissions
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(admin)}
                                                    disabled={removeMutation.isPending}
                                                    title="Remove admin access"
                                                    style={{
                                                        padding: '0.5rem 0.875rem', backgroundColor: '#fee2e2', color: '#ef4444',
                                                        border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                                                        fontSize: '0.8125rem', fontWeight: 600,
                                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fecaca'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                >
                                                    <i className="fas fa-trash" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modules bar — for non-main admins, show which modules they can access */}
                                    {!isMain && hasModules && (
                                        <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                                                Permitted Sections:
                                            </div>
                                            {admin.allowed_modules.length === 0 ? (
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                                    No sections permitted — dashboard only
                                                </span>
                                            ) : (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                    {admin.allowed_modules.map(key => {
                                                        const mod = ALL_MODULES.find(m => m.key === key);
                                                        if (!mod) return null;
                                                        return (
                                                            <span key={key} style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                                padding: '0.2rem 0.6rem', borderRadius: '999px',
                                                                fontSize: '0.75rem', fontWeight: 600,
                                                                backgroundColor: `${mod.color}15`, color: mod.color,
                                                                border: `1px solid ${mod.color}30`
                                                            }}>
                                                                <i className={mod.icon} style={{ fontSize: '0.65rem' }} />
                                                                {mod.label}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isMainAdmin && (
                    <p style={{ margin: '1.5rem 0 0', fontSize: '0.8125rem', color: '#94a3b8', textAlign: 'center' }}>
                        <i className="fas fa-info-circle" style={{ marginRight: '0.4rem' }} />
                        Only the <strong>main administrator</strong> can add, remove, or manage admin permissions.
                    </p>
                )}
            </div>
        </>
    );
};

export default AdminAdmins;
