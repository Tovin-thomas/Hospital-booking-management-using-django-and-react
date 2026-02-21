import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';

// ── Soft accent palette for department cards ────────────────────────────────────
const ACCENT_PALETTE = [
    { bg: '#eff6ff', icon: '#3b82f6', border: '#bfdbfe' },
    { bg: '#f0fdf4', icon: '#22c55e', border: '#bbf7d0' },
    { bg: '#fefce8', icon: '#eab308', border: '#fef08a' },
    { bg: '#fdf2f8', icon: '#ec4899', border: '#fbcfe8' },
    { bg: '#f5f3ff', icon: '#8b5cf6', border: '#ddd6fe' },
    { bg: '#fff7ed', icon: '#f97316', border: '#fed7aa' },
    { bg: '#ecfeff', icon: '#06b6d4', border: '#a5f3fc' },
    { bg: '#fdf4ff', icon: '#d946ef', border: '#f0abfc' },
];

const DEPT_ICONS = {
    cardiology: 'fa-heartbeat',
    neurology: 'fa-brain',
    orthopedics: 'fa-bone',
    pediatrics: 'fa-baby',
    gynecology: 'fa-venus',
    oncology: 'fa-ribbon',
    dermatology: 'fa-allergies',
    ophthalmology: 'fa-eye',
    ent: 'fa-ear-deaf',
    radiology: 'fa-x-ray',
    psychiatry: 'fa-brain',
    dentistry: 'fa-tooth',
    urology: 'fa-kidneys',
    gastroenterology: 'fa-stomach',
    pulmonology: 'fa-lungs',
    nephrology: 'fa-kidneys',
    endocrinology: 'fa-syringe',
    rheumatology: 'fa-hand-dots',
    hematology: 'fa-droplet',
    emergency: 'fa-truck-medical',
};

const getDeptIcon = (name = '') => {
    const key = name.toLowerCase();
    for (const [k, icon] of Object.entries(DEPT_ICONS)) {
        if (key.includes(k)) return icon;
    }
    return 'fa-hospital-user';
};

const Departments = () => {
    const { data: departments, isLoading } = useQuery({
        queryKey: ['departments'],
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.departments.list);
            return response.data.results || response.data;
        },
    });

    return (
        <>
            {/* ── CSS Animations ── */}
            <style>{`
                @keyframes deptFadeInUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes deptFloat {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-8px); }
                }
                .dept-card {
                    transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s cubic-bezier(.4,0,.2,1);
                }
                .dept-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px -12px rgba(0,0,0,0.12);
                }
                .dept-card:hover .dept-arrow {
                    transform: translateX(5px);
                }
                .dept-arrow {
                    transition: transform 0.25s ease;
                }
                .dept-icon-wrapper {
                    transition: transform 0.3s ease;
                }
                .dept-card:hover .dept-icon-wrapper {
                    transform: scale(1.1);
                }
            `}</style>

            <section style={{ minHeight: 'calc(100vh - 200px)', backgroundColor: '#fafbfc' }}>

                {/* ── Hero Section ── */}
                <div style={{
                    background: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 40%, #f5f3ff 100%)',
                    padding: '5rem 0 4rem',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Decorative shapes */}
                    <div style={{
                        position: 'absolute', top: '-60px', right: '5%',
                        width: '260px', height: '260px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '-40px', left: '8%',
                        width: '180px', height: '180px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            backgroundColor: 'white', color: '#6366f1',
                            padding: '0.4rem 1.25rem', borderRadius: '50px',
                            fontSize: '0.8125rem', fontWeight: 600,
                            marginBottom: '1.25rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(99,102,241,0.12)',
                        }}>
                            <i className="fas fa-hospital" style={{ fontSize: '0.75rem' }}></i>
                            Our Specializations
                        </span>

                        <h1 style={{
                            fontWeight: 800, fontSize: '3rem', color: '#0f172a',
                            marginBottom: '1rem', lineHeight: 1.2,
                            letterSpacing: '-0.02em',
                        }}>
                            Medical Departments
                        </h1>
                        <p style={{
                            color: '#64748b', maxWidth: '560px', margin: '0 auto',
                            fontSize: '1.1rem', lineHeight: 1.7,
                        }}>
                            Explore our specialized departments — each led by experienced professionals dedicated to providing exceptional care.
                        </p>
                    </div>
                </div>

                {/* ── Departments Grid ── */}
                <div className="container" style={{ padding: '3rem 0 5rem' }}>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                            gap: '1.75rem',
                        }}>
                            {departments?.map((dept, idx) => {
                                const accent = ACCENT_PALETTE[idx % ACCENT_PALETTE.length];
                                const icon = getDeptIcon(dept.dep_name);

                                return (
                                    <Link
                                        to={`/departments/${dept.id}`}
                                        key={dept.id}
                                        className="dept-card"
                                        style={{
                                            textDecoration: 'none',
                                            backgroundColor: 'white',
                                            borderRadius: '1.25rem',
                                            padding: '2rem',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            border: '1px solid #f1f5f9',
                                            animation: `deptFadeInUp 0.5s ease-out ${idx * 0.06}s both`,
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className="dept-icon-wrapper" style={{
                                            width: '56px', height: '56px', borderRadius: '1rem',
                                            backgroundColor: accent.bg,
                                            border: `1px solid ${accent.border}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '1.25rem', flexShrink: 0,
                                        }}>
                                            <i className={`fas ${icon}`} style={{ fontSize: '1.35rem', color: accent.icon }}></i>
                                        </div>

                                        {/* Name */}
                                        <h3 style={{
                                            fontWeight: 700, fontSize: '1.2rem', color: '#0f172a',
                                            marginBottom: '0.5rem',
                                        }}>
                                            {dept.dep_name}
                                        </h3>

                                        {/* Description */}
                                        <p style={{
                                            color: '#64748b', lineHeight: 1.65, fontSize: '0.9375rem',
                                            marginBottom: '1.5rem', flex: 1,
                                            display: '-webkit-box', WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {dept.dep_decription}
                                        </p>

                                        {/* Footer */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingTop: '1rem',
                                            borderTop: '1px solid #f1f5f9',
                                        }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                backgroundColor: '#f8fafc', color: '#475569',
                                                padding: '0.3rem 0.85rem', borderRadius: '50px',
                                                fontSize: '0.8rem', fontWeight: 600,
                                            }}>
                                                <i className="fas fa-user-md" style={{ fontSize: '0.7rem', color: accent.icon }}></i>
                                                {dept.doctor_count || 0} Doctor{(dept.doctor_count || 0) !== 1 ? 's' : ''}
                                            </span>

                                            <span className="dept-arrow" style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                                color: accent.icon, fontSize: '0.875rem', fontWeight: 600,
                                            }}>
                                                Explore
                                                <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && (!departments || departments.length === 0) && (
                        <div style={{
                            textAlign: 'center', padding: '5rem 2rem',
                            backgroundColor: 'white', borderRadius: '1.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}>
                            <i className="fas fa-hospital" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem', display: 'block' }}></i>
                            <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: '0.5rem' }}>No Departments Yet</h3>
                            <p style={{ color: '#64748b' }}>Departments will appear here once added by an administrator.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Departments;
