import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/formatters';

const AdminDoctors = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const queryClient = useQueryClient();

    const { data: doctors, isLoading } = useQuery({
        queryKey: ['admin-doctors'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.doctors.list);
            return response.data.results || response.data;
        },
    });

    const { data: departments } = useQuery({
        queryKey: ['admin-departments'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.departments.list);
            return response.data.results || response.data;
        },
    });

    // Filter Logic
    const filteredDoctors = doctors?.filter(doctor => {
        const matchesSearch = (
            doctor.doc_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.doc_spec?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesDept = deptFilter === 'all' || doctor.department_name === deptFilter || doctor.department_id?.toString() === deptFilter;
        return matchesSearch && matchesDept;
    });

    if (isLoading) return <AdminLayout><Loading /></AdminLayout>;

    return (
        <AdminLayout>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>
                        Manage Doctors
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>
                        {filteredDoctors?.length || 0} doctors found
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedDoctor(null);
                        setShowModal(true);
                    }}
                    style={{
                        padding: '0.875rem 1.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                    }}
                >
                    <i className="fas fa-plus"></i>
                    Add New Doctor
                </button>
            </div>

            {/* Filters */}
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                    <input
                        type="text"
                        placeholder="Search doctors by name, email, or spec..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            outline: 'none',
                            fontSize: '0.875rem',
                            backgroundColor: '#f8fafc'
                        }}
                    />
                </div>
                <div style={{ width: '250px' }}>
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            outline: 'none',
                            fontSize: '0.875rem',
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Departments</option>
                        {departments?.map(dept => (
                            <option key={dept.id} value={dept.dep_name}>{dept.dep_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Doctors Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                ID
                            </th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Doctor Name
                            </th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Specialization
                            </th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Department
                            </th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Login Info
                            </th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Status
                            </th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDoctors?.length > 0 ? (
                            filteredDoctors.map((doctor) => (
                                <tr key={doctor.id} style={{
                                    borderBottom: '1px solid #e2e8f0',
                                    transition: 'background-color 0.15s'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontWeight: 600 }}>
                                        #{doctor.id}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {doctor.doc_image_url ? (
                                                <img
                                                    src={getImageUrl(doctor.doc_image_url)}
                                                    alt={doctor.doc_name}
                                                    style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '0.75rem',
                                                        objectFit: 'cover',
                                                        border: '2px solid #e2e8f0'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '0.75rem',
                                                    backgroundColor: '#dbeafe',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.25rem',
                                                    fontWeight: 700,
                                                    color: '#3b82f6'
                                                }}>
                                                    {doctor.doc_name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>Dr. {doctor.doc_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontWeight: 500 }}>
                                        {doctor.doc_spec}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#475569' }}>
                                        {doctor.department_name}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {doctor.username ? (
                                                <>
                                                    <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>
                                                        <i className="fas fa-user" style={{ marginRight: '0.5rem', color: '#3b82f6', fontSize: '0.75rem' }}></i>
                                                        {doctor.username}
                                                    </div>
                                                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                                                        <i className="fas fa-envelope" style={{ marginRight: '0.5rem', color: '#64748b', fontSize: '0.7rem' }}></i>
                                                        {doctor.email || 'No email'}
                                                    </div>
                                                </>
                                            ) : (
                                                <span style={{ fontSize: '0.8125rem', color: '#ef4444', fontStyle: 'italic' }}>
                                                    <i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>
                                                    No account
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.375rem 0.875rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.8125rem',
                                            fontWeight: 600,
                                            backgroundColor: doctor.current_status === 'Present' ? '#d1fae5' : '#fee2e2',
                                            color: doctor.current_status === 'Present' ? '#059669' : '#dc2626'
                                        }}>
                                            {doctor.current_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedDoctor(doctor);
                                                    setShowModal(true);
                                                }}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: '#f1f5f9',
                                                    color: '#3b82f6',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                                    e.currentTarget.style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                    e.currentTarget.style.color = '#3b82f6';
                                                }}
                                            >
                                                <i className="fas fa-edit" style={{ marginRight: '0.25rem' }}></i>
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                    <i className="fas fa-user-md" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>No doctors found</div>
                                    <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                        Try adjusting your search or filters
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Doctor Modal */}
            {showModal && (
                <DoctorModal
                    doctor={selectedDoctor}
                    departments={departments}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries(['admin-doctors']);
                        setShowModal(false);
                    }}
                />
            )}
        </AdminLayout>
    );
};

const DoctorModal = ({ doctor, departments, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: doctor?.username || '',
        password: '',
        email: doctor?.email || '',
        doc_name: doctor?.doc_name || '',
        doc_spec: doctor?.doc_spec || '',
        department_id: doctor?.department_id || '',
        doc_image: null,
    });
    const [imagePreview, setImagePreview] = useState(getImageUrl(doctor?.doc_image_url) || null);

    const createOrUpdateDoctor = useMutation({
        mutationFn: async (data) => {
            // Create FormData for multipart upload
            const formDataToSend = new FormData();

            // Add basic fields
            formDataToSend.append('doc_name', data.doc_name);
            formDataToSend.append('doc_spec', data.doc_spec);
            formDataToSend.append('department_id', data.department_id);

            // Add optional user fields
            if (data.username) formDataToSend.append('username', data.username);
            if (data.email) formDataToSend.append('email', data.email);
            if (data.password) formDataToSend.append('password', data.password);

            // Add image if provided
            if (data.doc_image) {
                formDataToSend.append('doc_image', data.doc_image);
            }

            if (doctor) {
                // UPDATE existing doctor
                const response = await axios.put(API_ENDPOINTS.doctors.update(doctor.id), formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } else {
                // CREATE new doctor
                const response = await axios.post(API_ENDPOINTS.doctors.create, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            }
        },
        onSuccess: (data) => {
            const message = doctor
                ? 'Doctor updated successfully! All changes have been saved.'
                : 'Doctor created successfully! They can now login with their credentials.';
            toast.success(message, { autoClose: 5000 });
            onSuccess();
        },
        onError: (error) => {
            console.error('Doctor mutation error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            const errors = error.response?.data;
            const status = error.response?.status;

            // Handle specific validation errors
            if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
                const errorFields = Object.keys(errors);

                // Limit to showing only first 3 field errors to prevent toast spam
                const fieldsToShow = errorFields.slice(0, 3);

                fieldsToShow.forEach(field => {
                    const fieldError = errors[field];
                    let message = '';

                    // Handle different error formats
                    if (Array.isArray(fieldError)) {
                        message = fieldError[0];
                    } else if (typeof fieldError === 'string') {
                        message = fieldError;
                    } else if (typeof fieldError === 'object') {
                        message = JSON.stringify(fieldError).substring(0, 100); // Limit message length
                    }

                    // Only show if message is reasonable length
                    if (message && message.length < 200) {
                        toast.error(`${field}: ${message}`);
                    }
                });

                // If there were more errors, show a summary
                if (errorFields.length > 3) {
                    toast.error(`... and ${errorFields.length - 3} more validation errors. Check console for details.`);
                }
            } else if (status === 400) {
                toast.error('Invalid data provided. Please check all fields.');
            } else if (status === 403) {
                toast.error('Permission denied. You must be logged in as Admin to edit doctors.');
            } else if (status === 500) {
                toast.error('Server error. Please check Django console for details.');
            } else if (error.message === 'Network Error') {
                toast.error('Network error. Please check if the server is running.');
            } else {
                toast.error(`Operation failed (${status || 'unknown'}). Check browser console for details.`);
            }
        },
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload a valid image file');
                return;
            }

            setFormData({ ...formData, doc_image: file });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.doc_name || !formData.doc_spec || !formData.department_id) {
            toast.error('Please fill in all required doctor fields');
            return;
        }

        // Check if we are creating a new account (New Doctor OR Existing Doctor without account)
        const isCreatingAccount = !doctor || (!doctor.username && formData.username);

        if (isCreatingAccount) {
            if (!formData.username || !formData.email || !formData.password) {
                toast.error('Please fill in all login credentials (username, email, password) to create an account');
                return;
            }
            if (formData.password.length < 8) {
                toast.error('Password must be at least 8 characters');
                return;
            }
        }

        createOrUpdateDoctor.mutate(formData);
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
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
                    {doctor ? 'Edit Doctor' : 'Add New Doctor & Create Account'}
                </h3>

                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
                    <p style={{ margin: 0, fontSize: '0.9375rem', color: '#1e40af', lineHeight: 1.6 }}>
                        <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
                        <strong>Note:</strong> {doctor
                            ? 'Update doctor information. Leave password blank to keep current password.'
                            : 'This will create both a doctor profile and a user account for login access.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* User Account Section */}
                    <div>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                            <i className="fas fa-user" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
                            Login Credentials
                        </h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="e.g., dr.smith"
                                    required
                                />
                                {doctor && (
                                    <small style={{ color: '#f59e0b', fontSize: '0.8125rem', display: 'block', marginTop: '0.25rem' }}>
                                        <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.25rem' }}></i>
                                        Changing username will affect login credentials
                                    </small>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                    Password {!doctor && '*'}
                                </label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={doctor ? "Leave blank to keep current" : "Min 8 characters"}
                                    required={!doctor}
                                />
                                {doctor && (
                                    <small style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                                        Leave blank to keep current password
                                    </small>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                    Email {!doctor && '*'}
                                </label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="doctor@hospital.com"
                                    required={!doctor}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Doctor Profile Section */}
                    <div>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                            <i className="fas fa-user-md" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                            Doctor Profile
                        </h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.doc_name}
                                    onChange={(e) => setFormData({ ...formData, doc_name: e.target.value })}
                                    placeholder="e.g., John Smith"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                    Specialization *
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.doc_spec}
                                    onChange={(e) => setFormData({ ...formData, doc_spec: e.target.value })}
                                    placeholder="e.g., Cardiologist"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                    Department *
                                </label>
                                <select
                                    className="form-select"
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments?.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.dep_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Profile Picture Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>
                                    <i className="fas fa-camera" style={{ marginRight: '0.5rem', color: '#8b5cf6' }}></i>
                                    Profile Picture
                                </label>

                                {/* Image Preview */}
                                {imagePreview && (
                                    <div style={{
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <img
                                            src={imagePreview}
                                            alt="Doctor preview"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '0.75rem',
                                                objectFit: 'cover',
                                                border: '3px solid #e2e8f0'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setFormData({ ...formData, doc_image: null });
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#fee2e2',
                                                color: '#dc2626',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                                            Remove
                                        </button>
                                    </div>
                                )}

                                {/* File Input */}
                                <div style={{
                                    position: 'relative',
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    backgroundColor: '#f8fafc',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <i className="fas fa-cloud-upload-alt" style={{
                                        fontSize: '2rem',
                                        color: '#3b82f6',
                                        marginBottom: '0.5rem',
                                        display: 'block'
                                    }}></i>
                                    <p style={{ margin: 0, color: '#475569', fontWeight: 600 }}>
                                        Click to upload or drag and drop
                                    </p>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
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
                                fontSize: '0.9375rem',
                                cursor: 'pointer'
                            }}
                            disabled={createOrUpdateDoctor.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                cursor: createOrUpdateDoctor.isPending ? 'not-allowed' : 'pointer',
                                opacity: createOrUpdateDoctor.isPending ? 0.7 : 1
                            }}
                            disabled={createOrUpdateDoctor.isPending}
                        >
                            <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                            {createOrUpdateDoctor.isPending
                                ? 'Saving...'
                                : doctor ? 'Update Doctor' : 'Create Doctor & Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDoctors;
