import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/formatters';

const DoctorCard = ({ doctor }) => {
    // Ensure we have a full URL for the image
    const doctorImage = getImageUrl(doctor.doc_image_url);

    // Professional fallback avatar if no image exists
    const imageUrl = doctorImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.doc_name)}&size=300&background=2563eb&color=fff`;

    return (
        <div className="card h-100 border-0" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}>

            {/* Image Container - Matching doctors.html style */}
            <div style={{ position: 'relative', overflow: 'hidden', height: '300px' }}>
                <img
                    src={imageUrl}
                    alt={doctor.doc_name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                    }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                }}>
                    <span style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                    }}>
                        {doctor.department_name}
                    </span>
                </div>
            </div>

            <div className="card-body" style={{ padding: '1.5rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h5 style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '1.25rem' }}>Dr. {doctor.doc_name}</h5>
                <p style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {doctor.doc_spec}
                </p>

                <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <h6 style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem'
                    }}>
                        Status & Availability
                    </h6>

                    {/* Present/Absent Badge */}
                    <div style={{ marginBottom: '1rem' }}>
                        {doctor.current_status === "Present" ? (
                            <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                                Present Today
                            </span>
                        ) : doctor.current_status === "Absent" ? (
                            <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                                Absent Today
                            </span>
                        ) : (
                            <span style={{ backgroundColor: '#f8fafc', color: '#64748b', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                                Off Duty
                            </span>
                        )}
                    </div>

                    {/* Weekly Schedule */}
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        {doctor.availabilities && doctor.availabilities.length > 0 ? (
                            doctor.availabilities.map((avail, idx) => (
                                <div key={idx} style={{ marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 700 }}>{avail.day_display}: </span>
                                    <span>{avail.start_time.substring(0, 5)} - {avail.end_time.substring(0, 5)}</span>
                                </div>
                            ))
                        ) : (
                            <div style={{ fontStyle: 'italic' }}>No schedule set</div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <Link
                        to={`/booking/${doctor.id}`}
                        style={{
                            display: 'inline-block',
                            width: '100%',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Book Appointment
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DoctorCard;
