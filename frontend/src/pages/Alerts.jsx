import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { AlertTriangle, Clock, Info, CheckCircle2 } from 'lucide-react';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const { data } = await api.get('/water-quality/alerts');
            setAlerts(data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 20000); // 20s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading alerts...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Alert History</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>View all threshold violations and system warnings</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {alerts.filter(a => a.level === 'Danger').length} Critical
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Level</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Parameter</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Message</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Value</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Time</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map((alert) => (
                            <tr key={alert._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: alert.level === 'Danger' ? '#fee2e2' : '#fffbeb',
                                        color: alert.level === 'Danger' ? '#ef4444' : '#f59e0b'
                                    }}>
                                        {alert.level === 'Danger' ? <AlertTriangle size={14} /> : <Info size={14} />}
                                        {alert.level}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{alert.parameter}</td>
                                <td style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>{alert.message}</td>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>{alert.value}</td>
                                <td style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} />
                                        {new Date(alert.createdAt).toLocaleString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>Acknowledge</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {alerts.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                        <CheckCircle2 size={48} style={{ marginBottom: '1rem', color: 'var(--secondary)' }} />
                        <h3>No alerts found</h3>
                        <p>All system parameters are within safe limits.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
