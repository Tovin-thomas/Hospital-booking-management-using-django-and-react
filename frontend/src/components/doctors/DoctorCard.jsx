import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/formatters';

/* ─── Helpers ─────────────────────────────────────────────────── */
const STATUS_MAP = {
    Present: { label: 'Available Today', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    Absent: { label: 'On Leave', bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' },
};

const DEPT_COLORS = [
    ['#dbeafe', '#1d4ed8'],
    ['#ede9fe', '#6d28d9'],
    ['#dcfce7', '#15803d'],
    ['#fef9c3', '#a16207'],
    ['#ffedd5', '#c2410c'],
    ['#fce7f3', '#be185d'],
];
const deptColor = (name = '') => DEPT_COLORS[name.charCodeAt(0) % DEPT_COLORS.length];

/* ─── Component ───────────────────────────────────────────────── */
const DoctorCard = ({ doctor }) => {
    const [imgError, setImgError] = useState(false);
    const [hovered, setHovered] = useState(false);

    const rawImage = getImageUrl(doctor.doc_image_url);
    const imageUrl = (!imgError && rawImage) ? rawImage : null;

    const initials = (doctor.doc_name || 'DR')
        .split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

    const status = STATUS_MAP[doctor.current_status] || null;
    const [chipBg, chipColor] = deptColor(doctor.department_name);

    /* First scheduled day, shown as a ribbon at bottom of image */
    const firstSlot = doctor.availabilities?.[0];

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                borderRadius: '1.25rem',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: hovered
                    ? '0 20px 40px -8px rgba(37,99,235,0.18), 0 4px 16px rgba(0,0,0,0.08)'
                    : '0 2px 12px rgba(0,0,0,0.07)',
                transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'transform 0.28s ease, box-shadow 0.28s ease',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* ── Photo / Avatar ───────────────────────────────── */}
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden', flexShrink: 0 }}>

                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={doctor.doc_name}
                        onError={() => setImgError(true)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top center',
                            transform: hovered ? 'scale(1.06)' : 'scale(1)',
                            transition: 'transform 0.4s ease',
                        }}
                    />
                ) : (
                    /* Gradient avatar fallback */
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 60%, #7c3aed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <span style={{
                            fontSize: '4rem',
                            fontWeight: 800,
                            color: 'rgba(255,255,255,0.9)',
                            letterSpacing: '-0.05em',
                            fontFamily: 'system-ui, sans-serif',
                        }}>
                            {initials}
                        </span>
                    </div>
                )}

                {/* Dark gradient at bottom of image */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(10,15,30,0.72) 0%, transparent 55%)',
                    pointerEvents: 'none',
                }} />

                {/* Department badge — top-right */}
                <span style={{
                    position: 'absolute',
                    top: '0.85rem',
                    right: '0.85rem',
                    backgroundColor: chipBg,
                    color: chipColor,
                    padding: '0.28rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(6px)',
                }}>
                    {doctor.department_name || 'General'}
                </span>

                {/* Status badge — top-left */}
                {status && (
                    <span style={{
                        position: 'absolute',
                        top: '0.85rem',
                        left: '0.85rem',
                        backgroundColor: status.bg,
                        color: status.color,
                        padding: '0.28rem 0.7rem',
                        borderRadius: '9999px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                    }}>
                        <span style={{
                            width: '6px', height: '6px',
                            borderRadius: '50%',
                            backgroundColor: status.dot,
                            display: 'inline-block',
                        }} />
                        {status.label}
                    </span>
                )}

                {/* Name + spec over the dark gradient */}
                <div style={{
                    position: 'absolute',
                    bottom: '0.9rem',
                    left: '1rem',
                    right: '1rem',
                }}>
                    <h5 style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.3,
                    }}>
                        Dr. {doctor.doc_name}
                    </h5>
                    <p style={{
                        margin: '0.2rem 0 0',
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontWeight: 500,
                    }}>
                        {doctor.doc_spec}
                    </p>
                </div>
            </div>

            {/* ── Body ─────────────────────────────────────────── */}
            <div style={{
                padding: '1.1rem 1.25rem 1.3rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
                flex: 1,
            }}>

                {/* Schedule pills */}
                <div>
                    {doctor.availabilities && doctor.availabilities.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {doctor.availabilities.slice(0, 3).map((avail, idx) => (
                                <span key={idx} style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                }}>
                                    <span style={{ color: '#2563eb', fontSize: '0.65rem' }}>●</span>
                                    {avail.day_display.slice(0, 3)} &nbsp;
                                    {avail.start_time.substring(0, 5)}–{avail.end_time.substring(0, 5)}
                                </span>
                            ))}
                            {doctor.availabilities.length > 3 && (
                                <span style={{
                                    backgroundColor: '#eff6ff',
                                    color: '#2563eb',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                }}>
                                    +{doctor.availabilities.length - 3} more
                                </span>
                            )}
                        </div>
                    ) : (
                        <p style={{
                            margin: 0,
                            fontSize: '0.78rem',
                            color: '#94a3b8',
                            fontStyle: 'italic',
                        }}>
                            Schedule not set yet
                        </p>
                    )}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

                {/* Book button */}
                <Link
                    to={`/booking/${doctor.id}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        background: hovered
                            ? 'linear-gradient(135deg,#1d4ed8,#4f46e5)'
                            : 'linear-gradient(135deg,#2563eb,#4f46e5)',
                        color: 'white',
                        padding: '0.7rem 1.5rem',
                        borderRadius: '0.75rem',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        transition: 'background 0.2s ease',
                        letterSpacing: '0.01em',
                    }}
                >
                    <i className="fas fa-calendar-check" style={{ fontSize: '0.85rem' }} />
                    Book Appointment
                </Link>
            </div>
        </div>
    );
};

export default DoctorCard;
