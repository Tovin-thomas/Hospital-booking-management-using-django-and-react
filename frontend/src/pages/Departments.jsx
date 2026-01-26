import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';

const Departments = () => {
    const { data: departments, isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.departments.list);
            return response.data.results || response.data;
        },
    });

    return (
        <section style={{ padding: '6rem 0', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontWeight: 800, fontSize: '3.5rem', marginBottom: '1rem', color: '#1e293b' }}>
                        Health Care Departments
                    </h1>
                    <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                        Explore our specialized departments tailored to provide comprehensive care for every medical need.
                    </p>
                </div>

                {isLoading ? (
                    <Loading />
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                    }}>
                        {departments?.map(dept => (
                            <div key={dept.id} className="card h-100 p-5 border-0 shadow-sm text-center" style={{ borderRadius: '1.5rem', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    backgroundColor: '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-hospital-user text-primary" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>{dept.dep_name}</h3>
                                <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>{dept.dep_decription}</p>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                                        {dept.doctor_count} Specialists
                                    </span>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <Link
                                        to={`/doctors?department=${dept.id}`}
                                        style={{
                                            color: '#2563eb',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            fontSize: '0.9375rem'
                                        }}
                                    >
                                        View Specialists <i className="fas fa-chevron-right ms-2" style={{ fontSize: '0.75rem' }}></i>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Departments;
