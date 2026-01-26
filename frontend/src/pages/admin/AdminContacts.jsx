import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import API_ENDPOINTS from '../../api/endpoints';
import AdminLayout from '../../components/admin/AdminLayout';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatters';

const AdminContacts = () => {
    const [selectedMessage, setSelectedMessage] = useState(null);

    const { data: messages, isLoading } = useQuery({
        queryKey: ['admin-contacts'],
        queryFn: async () => {
            const response = await axios.get(API_ENDPOINTS.contacts.list);
            return response.data.results || response.data;
        },
    });

    if (isLoading) return <AdminLayout><Loading /></AdminLayout>;

    const unreadCount = messages?.filter(m => !m.is_read).length || 0;

    return (
        <AdminLayout>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>
                    Contact Messages
                </h2>
                <p style={{ margin: 0, color: '#64748b' }}>
                    {messages?.length || 0} total messages
                    {unreadCount > 0 && (
                        <span style={{
                            marginLeft: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.875rem',
                            fontWeight: 600
                        }}>
                            {unreadCount} unread
                        </span>
                    )}
                </p>
            </div>

            {/* Messages List */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                {messages?.length > 0 ? (
                    <div>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                onClick={() => setSelectedMessage(message)}
                                style={{
                                    padding: '1.5rem',
                                    borderBottom: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.15s',
                                    backgroundColor: message.is_read ? 'white' : '#f0f9ff'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = message.is_read ? 'white' : '#f0f9ff'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            backgroundColor: '#dbeafe',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: '#3b82f6',
                                            flexShrink: 0
                                        }}>
                                            {message.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                                                    {message.name}
                                                </h3>
                                                {!message.is_read && (
                                                    <span style={{
                                                        padding: '0.25rem 0.625rem',
                                                        borderRadius: '9999px',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        fontSize: '0.625rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i>
                                                {message.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                                        <i className="fas fa-clock" style={{ marginRight: '0.375rem' }}></i>
                                        {formatDate(message.submitted_at)}
                                    </div>
                                </div>

                                <div style={{
                                    color: '#475569',
                                    lineHeight: 1.6,
                                    marginLeft: '64px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {message.message}
                                </div>

                                <div style={{
                                    marginLeft: '64px',
                                    marginTop: '0.75rem',
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMessage(message);
                                        }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#f1f5f9',
                                            color: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            fontWeight: 600,
                                            fontSize: '0.8125rem',
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
                                        <i className="fas fa-eye" style={{ marginRight: '0.375rem' }}></i>
                                        View Full
                                    </button>
                                    {!message.is_read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Mark as read API call
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#d1fae5',
                                                color: '#059669',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                fontWeight: 600,
                                                fontSize: '0.8125rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#059669';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#d1fae5';
                                                e.currentTarget.style.color = '#059669';
                                            }}
                                        >
                                            <i className="fas fa-check" style={{ marginRight: '0.375rem' }}></i>
                                            Mark Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <i className="fas fa-inbox" style={{ fontSize: '4rem', color: '#e2e8f0', marginBottom: '1rem' }}></i>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                            No Messages Yet
                        </h3>
                        <p style={{ margin: 0, color: '#64748b' }}>
                            Contact messages will appear here when users submit the contact form
                        </p>
                    </div>
                )}
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '2rem'
                    }}
                    onClick={() => setSelectedMessage(null)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                                Message Details
                            </h3>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                style={{
                                    padding: '0.5rem',
                                    backgroundColor: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '1.125rem',
                                    color: '#64748b',
                                    width: '36px',
                                    height: '36px'
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem' }}>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                                    From
                                </div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                                    {selectedMessage.name}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                                    Email
                                </div>
                                <div style={{ fontSize: '0.9375rem', color: '#475569' }}>
                                    <a href={`mailto:${selectedMessage.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                                        {selectedMessage.email}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                                Message
                            </div>
                            <div style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.9375rem' }}>
                                {selectedMessage.message}
                            </div>
                        </div>

                        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
                            <i className="fas fa-clock" style={{ marginRight: '0.5rem' }}></i>
                            Received on {formatDate(selectedMessage.submitted_at)}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminContacts;
