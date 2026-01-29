import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';

const AdminDepartments = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { data: departments, isLoading } = useQuery({
        queryKey: ['admin-departments'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.departments.list);
            return response.data.results || response.data;
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await axios.delete(API_ENDPOINTS.departments.delete(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-departments']);
            toast.success('Department deleted successfully');
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || 'Failed to delete department. It may have doctors assigned.');
        }
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredDepartments = departments?.filter(dept =>
        dept.dep_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.dep_decription?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <AdminLayout><Loading /></AdminLayout>;

    return (
        <AdminLayout>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>
                        Manage Departments
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>
                        {filteredDepartments?.length || 0} departments found
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedDept(null);
                        setShowModal(true);
                    }}
                    style={{
                        padding: '0.875rem 1.75rem',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#7c3aed';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#8b5cf6';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <i className="fas fa-plus"></i>
                    Add New Department
                </button>
            </div>



            {/* Search Filter */}
            <div style={{ marginBottom: '2rem', maxWidth: '400px' }}>
                <div style={{ position: 'relative' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                    <input
                        type="text"
                        placeholder="Search departments..."
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

            {/* Departments Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {filteredDepartments?.length > 0 ? (
                    filteredDepartments.map((dept) => (
                        <div
                            key={dept.id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '1rem',
                                padding: '2rem',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s',
                                border: '2px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = '#8b5cf6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '1rem',
                                    backgroundColor: '#ede9fe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-hospital" style={{ fontSize: '1.5rem', color: '#8b5cf6' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                                        {dept.dep_name}
                                    </h3>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        backgroundColor: '#dbeafe',
                                        color: '#1e40af',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {dept.doctor_count || 0} Doctors
                                    </div>
                                </div>
                            </div>

                            <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem', minHeight: '60px' }}>
                                {dept.dep_decription}
                            </p>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => {
                                        setSelectedDept(dept);
                                        setShowModal(true);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: '#f1f5f9',
                                        color: '#8b5cf6',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#8b5cf6';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        e.currentTarget.style.color = '#8b5cf6';
                                    }}
                                >
                                    <i className="fas fa-edit" style={{ marginRight: '0.5rem' }}></i>
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(dept.id, dept.dep_name)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: '#fef2f2',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#ef4444';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fef2f2';
                                        e.currentTarget.style.color = '#ef4444';
                                    }}
                                >
                                    <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <i className="fas fa-hospital" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                        <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>No departments found</h3>
                        <p style={{ margin: 0 }}>Try adjusting your search</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {
                showModal && (
                    <DepartmentModal
                        department={selectedDept}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            queryClient.invalidateQueries(['admin-departments']);
                            setShowModal(false);
                        }}
                    />
                )
            }
        </AdminLayout >
    );
};

const DepartmentModal = ({ department, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        dep_name: department?.dep_name || '',
        dep_decription: department?.dep_decription || '',
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            if (department) {
                await axios.put(API_ENDPOINTS.departments.update(department.id), data);
            } else {
                await axios.post(API_ENDPOINTS.departments.create, data);
            }
        },
        onSuccess: () => {
            toast.success(department ? 'Department updated successfully' : 'Department created successfully');
            onSuccess();
        },
        onError: (err) => {
            console.error(err);
            const msg = err.response?.data?.detail || err.response?.data?.dep_name?.[0] || 'Operation failed';
            toast.error(msg);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%'
            }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
                    {department ? 'Edit Department' : 'Add New Department'}
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                            Department Name *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.dep_name}
                            onChange={(e) => setFormData({ ...formData, dep_name: e.target.value })}
                            placeholder="e.g., Cardiology"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                            Description *
                        </label>
                        <textarea
                            className="form-input"
                            value={formData.dep_decription}
                            onChange={(e) => setFormData({ ...formData, dep_decription: e.target.value })}
                            placeholder="Brief description of the department..."
                            rows="4"
                            required
                            style={{ minHeight: '100px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            disabled={mutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                backgroundColor: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontWeight: 600,
                                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                                opacity: mutation.isPending ? 0.7 : 1
                            }}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <span><i className="fas fa-spinner fa-spin"></i> Saving...</span>
                            ) : (
                                <>
                                    <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                                    {department ? 'Update' : 'Create'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDepartments;
