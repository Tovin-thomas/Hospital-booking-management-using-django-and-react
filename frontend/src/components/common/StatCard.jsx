import React from 'react';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
    const colorMap = {
        primary: '#3b82f6', // blue-500
        secondary: '#64748b', // slate-500
        success: '#22c55e', // green-500
        warning: '#f59e0b', // amber-500
        danger: '#ef4444', // red-500
        info: '#06b6d4', // cyan-500
        dark: '#1e293b', // slate-800
    };

    const bgColorMap = {
        primary: '#eff6ff', // blue-50
        secondary: '#f8fafc', // slate-50
        success: '#f0fdf4', // green-50
        warning: '#fffbeb', // amber-50
        danger: '#fef2f2', // red-50
        info: '#ecfeff', // cyan-50
        dark: '#f1f5f9', // slate-100
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderLeft: `5px solid ${colorMap[color] || colorMap.primary}`
        }}>
            <div>
                <p style={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {title}
                </p>
                <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    margin: 0,
                    lineHeight: 1
                }}>
                    {value}
                </h3>
            </div>
            <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '0.75rem',
                backgroundColor: bgColorMap[color] || bgColorMap.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: colorMap[color] || colorMap.primary
            }}>
                {icon}
            </div>
        </div>
    );
};

export default StatCard;
