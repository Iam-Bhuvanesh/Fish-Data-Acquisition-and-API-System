import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Search, Filter, Download, Calendar } from 'lucide-react';

const History = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [station, setStation] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/water-quality?limit=50${station ? `&station=${station}` : ''}`);
            setData(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [station]);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Historical Data</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Management and analysis of all sensor readings</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Filter style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={16} />
                        <select
                            value={station}
                            onChange={(e) => setStation(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem 0.5rem 2.25rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'white',
                                appearance: 'none',
                                minWidth: '150px'
                            }}
                        >
                            <option value="">All Stations</option>
                            <option value="Station-01">Station-01</option>
                            <option value="Station-02">Station-02</option>
                            <option value="Station-03">Station-03</option>
                        </select>
                    </div>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                    }}>
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="glass-card">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Station</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Timestamp</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Temp (°C)</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>pH</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>DO (mg/L)</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Turb (NTU)</th>
                            <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</td></tr>
                        ) : data.map((row) => (
                            <tr key={row._id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>{row.station}</td>
                                <td style={{ padding: '1rem', color: 'var(--muted)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} />
                                        {new Date(row.createdAt).toLocaleString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>{row.temperature}</td>
                                <td style={{ padding: '1rem' }}>{row.ph}</td>
                                <td style={{ padding: '1rem' }}>{row.dissolvedOxygen}</td>
                                <td style={{ padding: '1rem' }}>{row.turbidity}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '10px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        background: row.status === 'Safe' ? '#dcfce7' : row.status === 'Warning' ? '#fef9c3' : '#fee2e2',
                                        color: row.status === 'Safe' ? '#166534' : row.status === 'Warning' ? '#854d0e' : '#991b1b'
                                    }}>
                                        {row.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
