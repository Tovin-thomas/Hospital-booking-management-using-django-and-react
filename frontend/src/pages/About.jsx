import React from 'react';

const About = () => {
    return (
        <section style={{ padding: '6rem 0', overflow: 'hidden' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '3rem', marginBottom: '5rem' }}>
                    <div style={{ flex: '1 1 500px', animation: 'fadeIn 0.8s ease-out' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            backgroundColor: '#dbeafe',
                            color: '#2563eb',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            marginBottom: '1rem',
                        }}>
                            About City Hospital
                        </span>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1e293b' }}>
                            Leading the Way in Medical Excellence
                        </h1>
                        <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Since 1995, City Hospital has been at the forefront of medical innovation and patient care. We believe in treating every patient with dignity, respect, and the highest standard of medical professionalism.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div className="d-flex align-items-center">
                                <i className="fas fa-check-circle text-primary me-2"></i>
                                <span className="fw-bold">Certified Doctors</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <i className="fas fa-check-circle text-primary me-2"></i>
                                <span className="fw-bold">Modern Equipment</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <i className="fas fa-check-circle text-primary me-2"></i>
                                <span className="fw-bold">24/7 Services</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <i className="fas fa-check-circle text-primary me-2"></i>
                                <span className="fw-bold">Affordable Care</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: '1 1 400px', animation: 'fadeIn 0.8s ease-out 0.2s', opacity: 0, animationFillMode: 'forwards' }}>
                        <img
                            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop"
                            className="img-fluid rounded-4 shadow-lg"
                            alt="About City Hospital"
                            style={{ borderRadius: '2rem' }}
                        />
                    </div>
                </div>

                <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '4rem', borderRadius: '2rem', animation: 'fadeIn 0.8s ease-out' }}>
                    <div className="row text-center gy-4">
                        <div className="col-md-4">
                            <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>25+</h2>
                            <p className="mb-0">Years of Experience</p>
                        </div>
                        <div className="col-md-4">
                            <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>1M+</h2>
                            <p className="mb-0">Happy Patients</p>
                        </div>
                        <div className="col-md-4">
                            <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>100%</h2>
                            <p className="mb-0">Quality Commitment</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
