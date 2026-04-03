import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { BarChart3, Plus, FileText, Calendar, TrendingUp, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin, user } = useAuth();
    const [exportDates, setExportDates] = useState({
        startDate: '',
        endDate: ''
    });
    const [showExportOptions, setShowExportOptions] = useState(false);

    const fetchReports = async () => {
        try {
            const { data } = await api.get('/reports');
            setReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            await api.post('/reports/generate', {});
            fetchReports();
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Only Admins can generate reports');
        }
    };

    const handleExport = () => {
        let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/export/csv`;
        const params = new URLSearchParams();
        if (exportDates.startDate) params.append('startDate', exportDates.startDate);
        if (exportDates.endDate) params.append('endDate', exportDates.endDate);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        // We need to pass the token. Since it's a GET request for a file download,
        // we can either use fetch and create a blob, or pass token in query if backend supports it.
        // For simplicity and security, let's use fetch.
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Export failed');
            return response.blob();
        })
        .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `WaterQuality_Export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(error => {
            console.error('Export error:', error);
            alert('Failed to export data');
        });
    };

    const setDatePreset = (type) => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (type === 'today') {
            start.setHours(0, 0, 0, 0);
        } else if (type === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (type === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
        }

        setExportDates({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        });
    };

    useEffect(() => {
        fetchReports();
    }, []);

    if (loading) return <div>Loading reports...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Analytics Reports</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>System performance and water quality summaries</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowExportOptions(!showExportOptions)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                background: 'white',
                                color: 'var(--foreground)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                fontWeight: 600,
                            }}
                        >
                            <Download size={20} />
                            Export Data
                            <ChevronDown size={16} />
                        </button>

                        {showExportOptions && (
                            <div className="glass-card" style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                width: '300px',
                                zIndex: 100,
                                padding: '1.25rem',
                                boxShadow: 'var(--shadow-lg)'
                            }}>
                                <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Select Range</h4>
                                
                                <div style={{ background: '#f0f9ff', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bae6fd' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>YOUR API KEY (for 3rd party access)</label>
                                    <code style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: '#0369a1' }}>{user?.apiKey || 'Login again to see key'}</code>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Use header: <code>x-api-key</code></p>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <button onClick={() => setDatePreset('today')} style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: '#f8fafc' }}>Today</button>
                                    <button onClick={() => setDatePreset('month')} style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: '#f8fafc' }}>This Month</button>
                                    <button onClick={() => setDatePreset('year')} style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: '#f8fafc' }}>This Year</button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '0.25rem' }}>From</label>
                                        <input 
                                            type="date" 
                                            value={exportDates.startDate}
                                            onChange={(e) => setExportDates({...exportDates, startDate: e.target.value})}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '0.25rem' }}>To</label>
                                        <input 
                                            type="date" 
                                            value={exportDates.endDate}
                                            onChange={(e) => setExportDates({...exportDates, endDate: e.target.value})}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleExport}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        borderRadius: 'var(--radius)',
                                        fontWeight: 600,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Download size={18} />
                                    Download CSV
                                </button>
                            </div>
                        )}
                    </div>

                    {isAdmin() && (
                        <button
                            onClick={handleGenerate}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                background: 'var(--primary)',
                                color: 'white',
                                borderRadius: 'var(--radius)',
                                fontWeight: 600,
                                boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)'
                            }}
                        >
                            <Plus size={20} />
                            Generate Report
                        </button>
                    )}
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {reports.map((report) => (
                    <div key={report._id} className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', background: '#f0f9ff', color: 'var(--primary)', borderRadius: '10px' }}>
                                <FileText size={24} />
                            </div>
                            <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'right' }}>
                                <div style={{ fontWeight: 600 }}>#{report._id.slice(-6)}</div>
                                <div>{new Date(report.generatedAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>AVERAGE METRICS</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.75rem' }}>
                                    Temp: <strong>{report.summaryData.tempAvg.toFixed(1)}°C</strong>
                                </div>
                                <div style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.75rem' }}>
                                    pH: <strong>{report.summaryData.phAvg.toFixed(1)}</strong>
                                </div>
                                <div style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.75rem' }}>
                                    DO: <strong>{report.summaryData.doAvg.toFixed(1)}</strong>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                                <TrendingUp size={16} />
                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{report.summaryData.totalAlerts} Alerts</span>
                            </div>
                            <button style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>View Full</button>
                        </div>
                    </div>
                ))}

                {reports.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                        <BarChart3 size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <h3>No reports generated yet</h3>
                        <p>Click "Generate Report" to create your first system summary.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
