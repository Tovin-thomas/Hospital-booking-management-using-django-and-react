import React, { useState } from 'react';
import axios from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';
import { toast } from 'react-toastify';

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log('Submitting contact form:', formData);  // Debug log

        try {
            const response = await axios.post(API_ENDPOINTS.contacts.create, formData);
            console.log('Contact form response:', response.data);  // Debug log
            toast.success('Thank you for your message! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Contact form error:', error.response?.data || error.message);  // Debug log
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.message ||
                (typeof error.response?.data === 'object' ?
                    Object.values(error.response?.data).flat().join(', ') :
                    'Failed to send message. Please try again.');
            toast.error(errorMessage);
        }

        setLoading(false);
    };

    return (
        <section style={{ padding: '6rem 0', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontWeight: 800, fontSize: '3.5rem', marginBottom: '1rem' }}>Get in Touch</h1>
                    <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                        Have questions or need assistance? Our friendly team is here to help you 24/7.
                    </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <div className="card h-100 p-5 border-0 shadow-sm" style={{ borderRadius: '1.5rem', backgroundColor: 'white' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '2.5rem', color: '#1e293b' }}>Contact Information</h3>

                            <ContactInfoItem
                                icon="fas fa-map-marker-alt"
                                title="Our Location"
                                content="123 Health Ave, Medical District, City 56789"
                            />
                            <ContactInfoItem
                                icon="fas fa-envelope"
                                title="Email Us"
                                content={<>info@cityhospital.com<br />support@cityhospital.com</>}
                            />
                            <ContactInfoItem
                                icon="fas fa-phone-alt"
                                title="Call Us"
                                content={<>Emergency: 0123456789<br />Reception: 0123456700</>}
                            />

                            <div style={{ marginTop: 'auto' }}>
                                <h5 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Follow Us</h5>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {[
                                        { icon: 'fab fa-facebook-f', color: '#2563eb' },
                                        { icon: 'fab fa-twitter', color: '#1da1f2' },
                                        { icon: 'fab fa-instagram', color: '#e4405f' },
                                    ].map((social, idx) => (
                                        <a key={idx} href="#" style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#2563eb',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textDecoration: 'none',
                                            transition: 'transform 0.2s'
                                        }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                            <i className={social.icon}></i>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: '1 1 500px' }}>
                        <div className="card p-5 border-0 shadow-sm" style={{ borderRadius: '1.5rem', backgroundColor: 'white' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '2.5rem', color: '#1e293b' }}>Send Us a Message</h3>
                            <form onSubmit={handleSubmit} style={{ boxShadow: 'none', padding: 0, backgroundColor: 'transparent' }}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Subject *</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            className="form-input"
                                            placeholder="How can we help?"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Message *</label>
                                        <textarea
                                            name="message"
                                            className="form-input"
                                            rows="5"
                                            placeholder="Your message here..."
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            style={{ minHeight: '150px' }}
                                        ></textarea>
                                    </div>
                                    <div className="col-12 mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg w-100"
                                            style={{ padding: '1rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1.1rem' }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Sending...' : (
                                                <><i className="fas fa-paper-plane me-2"></i>Send Message</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ContactInfoItem = ({ icon, title, content }) => (
    <div style={{ display: 'flex', marginBottom: '2.5rem' }}>
        <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1.25rem',
            flexShrink: 0
        }}>
            <i className={`${icon} text-primary`} style={{ fontSize: '1.2rem' }}></i>
        </div>
        <div>
            <h5 style={{ fontWeight: 700, marginBottom: '0.35rem', fontSize: '1.15rem', color: '#1e293b' }}>{title}</h5>
            <div style={{ color: '#64748b', marginBottom: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>{content}</div>
        </div>
    </div>
);

export default Contact;
