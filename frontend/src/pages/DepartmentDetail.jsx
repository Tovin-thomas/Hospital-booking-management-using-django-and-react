import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/formatters';

// ── Icon map ────────────────────────────────────────────────────────────────────
const DEPT_ICONS = {
    cardiology: 'fa-heartbeat', neurology: 'fa-brain', orthopedics: 'fa-bone',
    pediatrics: 'fa-baby', gynecology: 'fa-venus', oncology: 'fa-ribbon',
    dermatology: 'fa-allergies', ophthalmology: 'fa-eye', ent: 'fa-ear-deaf',
    radiology: 'fa-x-ray', psychiatry: 'fa-brain', dentistry: 'fa-tooth',
    urology: 'fa-kidneys', gastroenterology: 'fa-stomach', pulmonology: 'fa-lungs',
    nephrology: 'fa-kidneys', endocrinology: 'fa-syringe', rheumatology: 'fa-hand-dots',
    hematology: 'fa-droplet', emergency: 'fa-truck-medical',
};
const getDeptIcon = (name = '') => {
    const key = name.toLowerCase();
    for (const [k, icon] of Object.entries(DEPT_ICONS)) {
        if (key.includes(k)) return icon;
    }
    return 'fa-hospital-user';
};

const DepartmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isAdmin = user?.is_staff || user?.is_superuser;

    // ── Blog form state ──
    const [showBlogForm, setShowBlogForm] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [blogForm, setBlogForm] = useState({ title: '', content: '', image: null });
    const [blogImagePreview, setBlogImagePreview] = useState(null);

    // ── Fetch department ──
    const { data: department, isLoading: deptLoading, isError } = useQuery({
        queryKey: ['department', id],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const res = await axios.get(API_ENDPOINTS.departments.detail(id));
            return res.data;
        },
    });

    // ── Fetch doctors ──
    const { data: doctors, isLoading: doctorsLoading } = useQuery({
        queryKey: ['doctors-by-dept', id],
        staleTime: 5 * 60 * 1000,
        enabled: !!id,
        queryFn: async () => {
            const res = await axios.get(`${API_ENDPOINTS.doctors.list}?dep_name=${id}`);
            return res.data.results || res.data;
        },
    });

    // ── Fetch blogs ──
    const { data: blogs } = useQuery({
        queryKey: ['department-blogs', id],
        staleTime: 2 * 60 * 1000,
        enabled: !!id,
        queryFn: async () => {
            const res = await axios.get(`${API_ENDPOINTS.departmentBlogs.list}?department=${id}`);
            return res.data.results || res.data;
        },
    });

    // ── Blog mutations ──
    const createBlog = useMutation({
        mutationFn: async (formData) => {
            const res = await axios.post(API_ENDPOINTS.departmentBlogs.create, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['department-blogs', id]);
            resetBlogForm();
        },
    });

    const updateBlog = useMutation({
        mutationFn: async ({ blogId, formData }) => {
            const res = await axios.patch(API_ENDPOINTS.departmentBlogs.update(blogId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['department-blogs', id]);
            resetBlogForm();
        },
    });

    const deleteBlog = useMutation({
        mutationFn: async (blogId) => {
            await axios.delete(API_ENDPOINTS.departmentBlogs.delete(blogId));
        },
        onSuccess: () => queryClient.invalidateQueries(['department-blogs', id]),
    });

    const resetBlogForm = () => {
        setShowBlogForm(false);
        setEditingBlog(null);
        setBlogForm({ title: '', content: '', image: null });
        setBlogImagePreview(null);
    };

    const handleBlogSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('department', id);
        formData.append('title', blogForm.title);
        formData.append('content', blogForm.content);
        if (blogForm.image) formData.append('image', blogForm.image);

        if (editingBlog) {
            updateBlog.mutate({ blogId: editingBlog.id, formData });
        } else {
            createBlog.mutate(formData);
        }
    };

    const startEditBlog = (blog) => {
        setEditingBlog(blog);
        setBlogForm({ title: blog.title, content: blog.content, image: null });
        setBlogImagePreview(blog.image_url);
        setShowBlogForm(true);
        // scroll to form
        setTimeout(() => document.getElementById('blog-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBlogForm(p => ({ ...p, image: file }));
            setBlogImagePreview(URL.createObjectURL(file));
        }
    };

    // ── Loading / Error states ──
    if (deptLoading || doctorsLoading) return (
        <div style={{ padding: '6rem 0', backgroundColor: '#fafbfc', minHeight: 'calc(100vh - 200px)' }}>
            <Loading />
        </div>
    );

    if (isError || !department) return (
        <div style={{ padding: '6rem 0', backgroundColor: '#fafbfc', minHeight: 'calc(100vh - 200px)', textAlign: 'center' }}>
            <div style={{
                maxWidth: '420px', margin: '0 auto', padding: '3rem 2rem',
                backgroundColor: 'white', borderRadius: '1.5rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '1rem', display: 'block' }}></i>
                <h2 style={{ color: '#1e293b', marginBottom: '0.5rem', fontWeight: 700 }}>Department Not Found</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The department you're looking for doesn't exist or has been removed.</p>
                <button onClick={() => navigate('/departments')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    backgroundColor: '#3b82f6', color: 'white',
                    padding: '0.75rem 1.75rem', borderRadius: '50px',
                    border: 'none', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer',
                }}>
                    <i className="fas fa-arrow-left"></i> Back to Departments
                </button>
            </div>
        </div>
    );

    const icon = getDeptIcon(department.dep_name);
    const doctorList = doctors || [];
    const blogList = blogs || [];
    const availableDocs = doctorList.filter(d => d.current_status === 'Present').length;

    return (
        <>
            {/* ── CSS ── */}
            <style>{`
                @keyframes detailFadeIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .doc-row { transition: all 0.25s ease; }
                .doc-row:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -6px rgba(0,0,0,0.1); }
                .doc-row:hover .doc-avatar { transform: scale(1.05); }
                .doc-avatar { transition: transform 0.4s ease; }
                .book-btn-sm { transition: all 0.2s ease; }
                .book-btn-sm:hover { background-color: #2563eb !important; box-shadow: 0 4px 12px -2px rgba(37,99,235,0.35); }
                .back-link { transition: all 0.25s ease; }
                .back-link:hover { border-color: #3b82f6 !important; color: #3b82f6 !important; }
                .hero-edit-btn { transition: all 0.25s ease; }
                .hero-edit-btn:hover { background-color: #d97706 !important; transform: translateY(-2px); }
                .blog-card { transition: all 0.3s ease; }
                .blog-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px -8px rgba(0,0,0,0.12); }
                .blog-action-btn { transition: all 0.2s ease; border: none; cursor: pointer; border-radius: 0.5rem; font-weight: 600; font-size: 0.75rem; padding: 0.4rem 0.75rem; }
                .blog-action-btn:hover { opacity: 0.85; }
            `}</style>

            <div style={{ backgroundColor: '#fafbfc', minHeight: 'calc(100vh - 200px)' }}>

                {/* ═══ HERO ═══ */}
                <div style={{
                    background: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 40%, #f5f3ff 100%)',
                    padding: '3.5rem 0 3rem', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-80px', right: '3%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-50px', left: '6%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        {/* Breadcrumb */}
                        <nav style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
                            <span style={{ color: '#cbd5e1' }}>/</span>
                            <Link to="/departments" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>Departments</Link>
                            <span style={{ color: '#cbd5e1' }}>/</span>
                            <span style={{ color: '#0f172a', fontWeight: 600 }}>{department.dep_name}</span>
                        </nav>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', animation: 'detailFadeIn 0.5s ease-out' }}>
                            <div style={{
                                width: '68px', height: '68px', borderRadius: '1rem',
                                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                boxShadow: '0 10px 24px -6px rgba(99,102,241,0.3)',
                            }}>
                                <i className={`fas ${icon}`} style={{ fontSize: '1.6rem', color: 'white' }}></i>
                            </div>
                            <div style={{ flex: 1, minWidth: '220px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                    <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                                        {department.dep_name}
                                    </h1>
                                    <span style={{
                                        backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb',
                                        padding: '0.25rem 0.75rem', borderRadius: '50px',
                                        fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(59,130,246,0.15)',
                                    }}>
                                        {doctorList.length} Specialist{doctorList.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.65, margin: 0 }}>
                                    {department.dep_decription}
                                </p>
                            </div>
                            {isAdmin && (
                                <Link to="/admin/departments" className="hero-edit-btn" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    backgroundColor: '#f59e0b', color: 'white',
                                    padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
                                    textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                                    boxShadow: '0 4px 12px rgba(245,158,11,0.3)', flexShrink: 0,
                                }}>
                                    <i className="fas fa-edit"></i> Edit in Admin
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ STATS BAR ═══ */}
                <div style={{ backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', padding: '1rem 0' }}>
                    <div className="container">
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <StatItem icon="fa-user-md" iconBg="#eff6ff" iconColor="#3b82f6" value={doctorList.length} label="Specialists" />
                            <div style={{ width: '1px', height: '32px', backgroundColor: '#f1f5f9' }} />
                            <StatItem icon="fa-check-circle" iconBg="#f0fdf4" iconColor="#22c55e" value={availableDocs} label="Available Today" />
                            <div style={{ width: '1px', height: '32px', backgroundColor: '#f1f5f9' }} />
                            <StatItem icon="fa-stethoscope" iconBg="#fdf2f8" iconColor="#ec4899"
                                value={[...new Set(doctorList.map(d => d.doc_spec).filter(Boolean))].length}
                                label="Specializations" />
                        </div>
                    </div>
                </div>

                {/* ═══ CONTENT ═══ */}
                <div className="container" style={{ padding: '2.5rem 0 4rem' }}>

                    {/* ── DOCTORS ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '4px', height: '22px', borderRadius: '2px', background: 'linear-gradient(180deg, #3b82f6, #6366f1)' }}></div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Our Doctors</h2>
                    </div>

                    {doctorList.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '3rem 2rem',
                            backgroundColor: 'white', borderRadius: '1rem',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
                        }}>
                            <i className="fas fa-user-md" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '0.75rem', display: 'block' }}></i>
                            <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>No Doctors Assigned Yet</h3>
                            <p style={{ color: '#64748b', maxWidth: '380px', margin: '0 auto', fontSize: '0.875rem' }}>
                                Doctors will appear here once assigned to this department.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {doctorList.map((doctor, index) => (
                                <DoctorCompactCard key={doctor.id} doctor={doctor} index={index} isAdmin={isAdmin} />
                            ))}
                        </div>
                    )}

                    {/* ═══ BLOGS SECTION ═══ */}
                    <div style={{ marginTop: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '4px', height: '22px', borderRadius: '2px', background: 'linear-gradient(180deg, #8b5cf6, #d946ef)' }}></div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                                    Department Blog
                                </h2>
                                {blogList.length > 0 && (
                                    <span style={{
                                        backgroundColor: '#f5f3ff', color: '#7c3aed',
                                        padding: '0.2rem 0.6rem', borderRadius: '50px',
                                        fontSize: '0.7rem', fontWeight: 700,
                                    }}>
                                        {blogList.length}
                                    </span>
                                )}
                            </div>
                            {isAdmin && !showBlogForm && (
                                <button onClick={() => { resetBlogForm(); setShowBlogForm(true); }} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                    backgroundColor: '#8b5cf6', color: 'white',
                                    padding: '0.55rem 1.1rem', borderRadius: '0.65rem',
                                    border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
                                }}>
                                    <i className="fas fa-plus"></i> New Post
                                </button>
                            )}
                        </div>

                        {/* ── Blog Form (Admin) ── */}
                        {isAdmin && showBlogForm && (
                            <div id="blog-form" style={{
                                backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem',
                                marginBottom: '1.5rem', border: '1px solid #e9d5ff',
                                boxShadow: '0 2px 8px rgba(139,92,246,0.08)',
                                animation: 'detailFadeIn 0.3s ease-out',
                            }}>
                                <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                                    <i className="fas fa-pen" style={{ marginRight: '0.5rem', color: '#8b5cf6' }}></i>
                                    {editingBlog ? 'Edit Post' : 'Create New Post'}
                                </h3>
                                <form onSubmit={handleBlogSubmit}>
                                    <div style={{ marginBottom: '0.875rem' }}>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem' }}>Title</label>
                                        <input
                                            type="text" required value={blogForm.title}
                                            onChange={(e) => setBlogForm(p => ({ ...p, title: e.target.value }))}
                                            placeholder="Enter blog post title..."
                                            style={{
                                                width: '100%', padding: '0.65rem 0.875rem', borderRadius: '0.6rem',
                                                border: '1.5px solid #e2e8f0', fontSize: '0.875rem',
                                                outline: 'none', backgroundColor: '#fafbfc',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '0.875rem' }}>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem' }}>Content</label>
                                        <textarea
                                            required value={blogForm.content}
                                            onChange={(e) => setBlogForm(p => ({ ...p, content: e.target.value }))}
                                            placeholder="Write your blog content..."
                                            rows={4}
                                            style={{
                                                width: '100%', padding: '0.65rem 0.875rem', borderRadius: '0.6rem',
                                                border: '1.5px solid #e2e8f0', fontSize: '0.875rem', resize: 'vertical',
                                                outline: 'none', fontFamily: 'inherit', backgroundColor: '#fafbfc',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem' }}>Image (Optional)</label>
                                        <input type="file" accept="image/*" onChange={handleImageChange}
                                            style={{ fontSize: '0.8rem', color: '#475569' }} />
                                        {blogImagePreview && (
                                            <img src={blogImagePreview} alt="Preview" style={{
                                                marginTop: '0.5rem', height: '80px', borderRadius: '0.5rem',
                                                objectFit: 'cover', border: '1px solid #e2e8f0',
                                            }} />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button type="submit" disabled={createBlog.isPending || updateBlog.isPending}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                backgroundColor: '#8b5cf6', color: 'white',
                                                padding: '0.6rem 1.25rem', borderRadius: '0.6rem',
                                                border: 'none', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer',
                                                opacity: (createBlog.isPending || updateBlog.isPending) ? 0.6 : 1,
                                            }}>
                                            <i className={`fas ${(createBlog.isPending || updateBlog.isPending) ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                                            {editingBlog ? 'Update Post' : 'Publish Post'}
                                        </button>
                                        <button type="button" onClick={resetBlogForm} style={{
                                            padding: '0.6rem 1.25rem', borderRadius: '0.6rem',
                                            border: '1.5px solid #e2e8f0', backgroundColor: 'white',
                                            color: '#64748b', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer',
                                        }}>
                                            Cancel
                                        </button>
                                    </div>
                                    {(createBlog.isError || updateBlog.isError) && (
                                        <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                            <i className="fas fa-exclamation-circle" style={{ marginRight: '0.3rem' }}></i>
                                            Failed to save blog post. Please try again.
                                        </p>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* ── Blog Cards ── */}
                        {blogList.length === 0 && !showBlogForm ? (
                            <div style={{
                                textAlign: 'center', padding: '2.5rem 2rem',
                                backgroundColor: 'white', borderRadius: '1rem',
                                border: '1px solid #f1f5f9',
                            }}>
                                <i className="fas fa-rss" style={{ fontSize: '1.75rem', color: '#d4d4d8', marginBottom: '0.75rem', display: 'block' }}></i>
                                <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: '0.4rem', fontSize: '1rem' }}>No Blog Posts Yet</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                                    {isAdmin ? 'Click "New Post" to share updates about this department.' : 'Blog posts about this department will appear here.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                                {blogList.map((blog, i) => (
                                    <div key={blog.id} className="blog-card" style={{
                                        backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden',
                                        border: '1px solid #f1f5f9',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                        animation: `detailFadeIn 0.4s ease-out ${i * 0.06}s both`,
                                    }}>
                                        {blog.image_url && (
                                            <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                                                <img src={blog.image_url} alt={blog.title} style={{
                                                    width: '100%', height: '100%', objectFit: 'cover',
                                                }} />
                                            </div>
                                        )}
                                        <div style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <i className="fas fa-calendar-alt" style={{ fontSize: '0.7rem', color: '#94a3b8' }}></i>
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                                                    {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '1rem', color: '#0f172a', lineHeight: 1.4 }}>
                                                {blog.title}
                                            </h3>
                                            <p style={{
                                                margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6,
                                                display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                            }}>
                                                {blog.content}
                                            </p>
                                            {isAdmin && (
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                                                    <button className="blog-action-btn" onClick={() => startEditBlog(blog)}
                                                        style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                                                        <i className="fas fa-edit" style={{ marginRight: '0.3rem' }}></i> Edit
                                                    </button>
                                                    <button className="blog-action-btn"
                                                        onClick={() => { if (window.confirm('Delete this blog post?')) deleteBlog.mutate(blog.id); }}
                                                        style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                                                        <i className="fas fa-trash" style={{ marginRight: '0.3rem' }}></i> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Back Button ── */}
                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                        <Link to="/departments" className="back-link" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            color: '#64748b', textDecoration: 'none', fontWeight: 600,
                            padding: '0.65rem 1.5rem', borderRadius: '50px',
                            border: '2px solid #e2e8f0', backgroundColor: 'white', fontSize: '0.875rem',
                        }}>
                            <i className="fas fa-arrow-left"></i> All Departments
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

// ─── Stat Item ──────────────────────────────────────────────────────────────────
const StatItem = ({ icon, iconBg, iconColor, value, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{
            width: '34px', height: '34px', borderRadius: '50%', backgroundColor: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <i className={`fas ${icon}`} style={{ color: iconColor, fontSize: '0.85rem' }}></i>
        </div>
        <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{label}</div>
        </div>
    </div>
);

// ─── Compact Doctor Card (horizontal row style) ────────────────────────────────
const DoctorCompactCard = ({ doctor, index, isAdmin }) => {
    const imageUrl = getImageUrl(doctor.doc_image_url) ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.doc_name)}&size=120&background=3b82f6&color=fff&font-size=0.4`;

    const statusMap = {
        Present: { bg: '#f0fdf4', text: '#15803d', label: 'Available', dot: '#22c55e', border: '#bbf7d0' },
        Absent: { bg: '#fef2f2', text: '#dc2626', label: 'Absent', dot: '#ef4444', border: '#fecaca' },
    };
    const status = statusMap[doctor.current_status] || { bg: '#f8fafc', text: '#64748b', label: 'Off Duty', dot: '#94a3b8', border: '#e2e8f0' };

    return (
        <div className="doc-row" style={{
            backgroundColor: 'white', borderRadius: '0.875rem',
            padding: '0.875rem 1.125rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            animation: `detailFadeIn 0.35s ease-out ${index * 0.05}s both`,
        }}>
            {/* Avatar */}
            <img className="doc-avatar" src={imageUrl} alt={doctor.doc_name} style={{
                width: '52px', height: '52px', borderRadius: '0.75rem',
                objectFit: 'cover', flexShrink: 0, backgroundColor: '#f1f5f9',
            }} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.925rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Dr. {doctor.doc_name}
                    </h4>
                    <span style={{
                        backgroundColor: status.bg, color: status.text,
                        padding: '0.15rem 0.5rem', borderRadius: '50px',
                        fontSize: '0.65rem', fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        border: `1px solid ${status.border}`,
                    }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: status.dot, display: 'inline-block' }}></span>
                        {status.label}
                    </span>
                </div>
                <p style={{ margin: '0.15rem 0 0', color: '#6366f1', fontWeight: 600, fontSize: '0.775rem' }}>
                    {doctor.doc_spec}
                </p>
                {/* Show first availability inline */}
                {doctor.availabilities && doctor.availabilities.length > 0 && (
                    <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>
                        <i className="fas fa-clock" style={{ marginRight: '0.25rem', fontSize: '0.6rem' }}></i>
                        {doctor.availabilities[0].day_display} {doctor.availabilities[0].start_time?.substring(0, 5)}–{doctor.availabilities[0].end_time?.substring(0, 5)}
                        {doctor.availabilities.length > 1 && <span style={{ marginLeft: '0.35rem', color: '#cbd5e1' }}>+{doctor.availabilities.length - 1}</span>}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <Link to={`/booking/${doctor.id}`} className="book-btn-sm" style={{
                    textDecoration: 'none', backgroundColor: '#3b82f6', color: 'white',
                    padding: '0.5rem 1rem', borderRadius: '0.6rem',
                    fontWeight: 600, fontSize: '0.775rem', whiteSpace: 'nowrap',
                }}>
                    <i className="fas fa-calendar-plus" style={{ marginRight: '0.3rem' }}></i>
                    Book
                </Link>
                {isAdmin && (
                    <Link to="/admin/doctors" title="Edit in Admin" style={{
                        padding: '0.5rem 0.6rem', borderRadius: '0.5rem',
                        backgroundColor: '#fef3c7', color: '#d97706',
                        textDecoration: 'none', fontWeight: 700, fontSize: '0.775rem',
                        display: 'flex', alignItems: 'center',
                    }}>
                        <i className="fas fa-edit"></i>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default DepartmentDetail;
