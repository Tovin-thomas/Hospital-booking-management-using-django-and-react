import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import DoctorCard from '../components/doctors/DoctorCard';
import Loading from '../components/common/Loading';

const Home = () => {
    // Fetch featured doctors
    const { data: doctors, isLoading } = useQuery({
        queryKey: ['doctors-featured'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.doctors.list);
            return response.data.results || response.data;
        },
    });

    return (
        <div>
            {/* Hero Section - Matching Original Design */}
            <section style={{
                padding: '8rem 0',
                background: 'radial-gradient(circle at top right, #dbeafe, transparent), radial-gradient(circle at bottom left, #fff1f2, transparent)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 500px', animation: 'fadeIn 0.8s ease-out' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                borderRadius: '50px',
                                backgroundColor: '#dbeafe',
                                color: '#2563eb',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                marginBottom: '1.5rem',
                            }}>
                                Healthcare Excellence
                            </span>
                            <h1 style={{
                                fontSize: '3.5rem',
                                fontWeight: 'bold',
                                lineHeight: 1.1,
                                marginBottom: '1.5rem',
                            }}>
                                Your Health, Our <span style={{ color: '#2563eb' }}>Priority</span>
                            </h1>
                            <p style={{
                                fontSize: '1.125rem',
                                color: '#64748b',
                                marginBottom: '2.5rem',
                                lineHeight: 1.6,
                            }}>
                                At City Hospital, we provide compassionate, patient-centered care with cutting-edge medical technology. Our team of specialists is dedicated to your well-being.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <Link to="/booking/1" className="btn btn-primary btn-lg shadow">
                                    Book Appointment <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                                </Link>
                                <Link to="/about" className="btn btn-outline btn-lg" style={{ borderWidth: '2px' }}>
                                    Learn More
                                </Link>
                            </div>
                        </div>
                        <div style={{ flex: '1 1 400px', animation: 'fadeIn 0.8s ease-out 0.2s', opacity: 0, animationFillMode: 'forwards' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    width: '100%',
                                    height: '100%',
                                    background: '#2563eb',
                                    opacity: 0.1,
                                    borderRadius: '2rem',
                                    zIndex: -1,
                                }}></div>
                                <img
                                    src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop"
                                    alt="City Hospital"
                                    style={{
                                        width: '100%',
                                        borderRadius: '2rem',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section - Overlapping */}
            <section style={{
                padding: '3rem 0',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                zIndex: 2,
                marginTop: '-3rem',
            }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem',
                        textAlign: 'center',
                    }}>
                        <StatBox number="500+" label="Qualified Doctors" />
                        <StatBox number="24/7" label="Emergency Support" />
                        <StatBox number="15+" label="Specialized Depts" />
                        <StatBox number="10k+" label="Recovered Patients" />
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            Our Specialized Services
                        </h2>
                        <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                            We offer a wide range of medical services provided by our world-class specialists using the latest medical equipment.
                        </p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                    }}>
                        <ServiceCard
                            icon="fas fa-heartbeat"
                            title="Cardiology"
                            description="Comprehensive heart care including diagnostics, treatment, and rehabilitation services."
                        />
                        <ServiceCard
                            icon="fas fa-brain"
                            title="Neurology"
                            description="Expert care for disorders of the nervous system, including advanced brain and spine treatments."
                        />
                        <ServiceCard
                            icon="fas fa-bone"
                            title="Orthopedics"
                            description="Advanced treatment for bone, joint, and muscle conditions for patients of all ages."
                        />
                    </div>
                </div>
            </section>

            {/* Featured Doctors Section */}
            <section style={{ padding: '4rem 0', backgroundColor: '#f8fafc' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem', fontWeight: 'bold' }}>
                        Meet Our Medical Specialists
                    </h2>

                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem',
                            }}>
                                {doctors?.slice(0, 4).map((doctor) => (
                                    <DoctorCard key={doctor.id} doctor={doctor} />
                                ))}
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                                <Link to="/doctors" className="btn btn-primary btn-lg">
                                    View All Doctors
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '4rem 0',
                background: '#2563eb',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ flex: '1 1 400px' }}>
                            <h2 style={{ color: 'white', fontWeight: 'bold', marginBottom: '1rem', fontSize: '2rem' }}>
                                Ready to receive expert medical care?
                            </h2>
                            <p style={{ fontSize: '1.125rem', opacity: 0.85 }}>
                                Book your appointment now and skip the waiting line.
                            </p>
                        </div>
                        <div style={{ flex: '0 0 auto' }}>
                            <Link to="/booking/1" className="btn btn-lg" style={{
                                backgroundColor: 'white',
                                color: '#2563eb',
                                padding: '0.875rem 2.5rem',
                                fontWeight: 'bold',
                            }}>
                                Book Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const StatBox = ({ number, label }) => (
    <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem' }}>
            {number}
        </h2>
        <p style={{ color: '#64748b', marginBottom: 0 }}>{label}</p>
    </div>
);

const ServiceCard = ({ icon, title, description }) => (
    <div className="card" style={{ padding: '2rem' }}>
        <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
        }}>
            <i className={icon} style={{ fontSize: '1.75rem', color: '#2563eb' }}></i>
        </div>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{title}</h4>
        <p style={{ color: '#64748b', marginBottom: 0, fontSize: '0.875rem' }}>
            {description}
        </p>
    </div>
);

export default Home;
