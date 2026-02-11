import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import DoctorCard from '../components/doctors/DoctorCard';
import Loading from '../components/common/Loading';

const Doctors = () => {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // Debounce search term to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch doctors with backend filtering
    const { data: doctors, isLoading: doctorsLoading } = useQuery({
        queryKey: ['doctors', debouncedSearchTerm, selectedDepartment],
        queryFn: async () => {
            // Build query parameters for backend filtering
            const params = new URLSearchParams();

            // Add search filter (backend will search in doc_name and doc_spec)
            if (debouncedSearchTerm) {
                params.append('search', debouncedSearchTerm);
            }

            // Add department filter (backend filterset_fields includes dep_name)
            if (selectedDepartment) {
                params.append('dep_name', selectedDepartment);
            }

            const url = `${API_ENDPOINTS.doctors.list}${params.toString() ? '?' + params.toString() : ''}`;
            const response = await axios.get(url);
            return response.data.results || response.data;
        },
    });

    // Fetch departments for filtering
    const { data: departments } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.departments.list);
            return response.data.results || response.data;
        },
    });

    // Read department from URL parameter on load
    useEffect(() => {
        const deptParam = searchParams.get('department');
        if (deptParam) {
            setSelectedDepartment(deptParam);
        }
    }, [searchParams]);

    // No need for frontend filtering anymore - backend handles it!
    // The 'doctors' data is already filtered by the API based on our query parameters
    const filteredDoctors = doctors || [];

    const getSelectedDeptName = () => {
        if (!selectedDepartment) return null;
        return departments?.find(d => d.id === parseInt(selectedDepartment))?.dep_name;
    };

    return (
        <div style={{ padding: '6rem 0', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontWeight: 800, fontSize: '3rem', marginBottom: '1rem' }}>
                        {selectedDepartment ? `${getSelectedDeptName()} Specialists` : 'Meet Our Medical Specialists'}
                    </h1>
                    <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                        Our team of highly qualified and experienced doctors is here to provide you with the best medical care possible.
                    </p>
                </div>

                {/* Search and Horizontal Filter Buttons */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                        <div style={{ position: 'relative' }}>
                            <i className="fas fa-search" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: '3rem', borderRadius: '50px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                placeholder="Search by name or specialization..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <button
                            onClick={() => setSelectedDepartment('')}
                            className={`btn btn-sm ${!selectedDepartment ? 'btn-primary' : 'btn-outline'}`}
                            style={{ borderRadius: '50px', padding: '0.5rem 1.5rem', fontWeight: 600 }}
                        >
                            <i className="fas fa-th-large" style={{ marginRight: '0.5rem' }}></i>
                            All Departments
                        </button>
                        {departments?.map(dept => (
                            <button
                                key={dept.id}
                                onClick={() => setSelectedDepartment(dept.id.toString())}
                                className={`btn btn-sm ${selectedDepartment === dept.id.toString() ? 'btn-primary' : 'btn-outline'}`}
                                style={{ borderRadius: '50px', padding: '0.5rem 1.5rem', fontWeight: 600 }}
                            >
                                {dept.dep_name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Doctors Count display matching original design */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        <i className="fas fa-user-md" style={{ marginRight: '0.5rem' }}></i>
                        <strong>{filteredDoctors?.length || 0}</strong> doctor{filteredDoctors?.length === 1 ? '' : 's'} found
                        {selectedDepartment && <span> in <strong>{getSelectedDeptName()}</strong></span>}
                    </p>
                </div>

                {/* Doctors List */}
                {doctorsLoading ? (
                    <Loading />
                ) : (
                    <>
                        {filteredDoctors && filteredDoctors.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '2rem',
                            }}>
                                {filteredDoctors.map(doctor => (
                                    <div key={doctor.id} style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
                                        <DoctorCard doctor={doctor} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                                <i className="fas fa-user-md" style={{ fontSize: '4rem', color: '#e2e8f0', marginBottom: '1.5rem' }}></i>
                                <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Doctors Found</h3>
                                <p style={{ color: '#64748b' }}>Try adjusting your search or filters.</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setSelectedDepartment(''); }}
                                    className="btn btn-primary"
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Call to Action matching original */}
            {!doctorsLoading && filteredDoctors?.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '5rem', padding: '4rem 0', borderTop: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Need a specific specialist?</h3>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>You can browse by department or book an appointment directly.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <Link to="/departments" className="btn btn-outline" style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}>
                            View Departments
                        </Link>
                        <Link to="/booking/1" className="btn btn-primary" style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}>
                            Book Now
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Doctors;
