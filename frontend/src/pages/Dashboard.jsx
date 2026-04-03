import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
    Thermometer,
    Droplet,
    Wind,
    MoveVertical,
    Activity,
    AlertCircle,
    CheckCircle2,
    BrainCircuit
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const MetricCard = ({ title, value, unit, icon, color, status }) => (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${color}15`, color: color }}>
                {icon}
            </div>
            <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: status === 'Safe' ? '#dcfce7' : status === 'Warning' ? '#fef9c3' : '#fee2e2',
                color: status === 'Safe' ? '#166534' : status === 'Warning' ? '#854d0e' : '#991b1b'
            }}>
                {status}
            </div>
        </div>
        <div>
            <div style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                {value} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--muted)' }}>{unit}</span>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [latest, setLatest] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [latestRes, historyRes] = await Promise.all([
                api.get('/water-quality/latest'),
                api.get('/water-quality?limit=10')
            ]);
            setLatest(latestRes.data);
            setHistory(historyRes.data.reverse().map(item => ({
                ...item,
                time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    const metrics = [
        { title: 'Temperature', value: latest?.temperature, unit: '°C', icon: <Thermometer size={24} />, color: '#0ea5e9', status: latest?.status || 'Safe' },
        { title: 'pH Level', value: latest?.ph, unit: 'pH', icon: <Activity size={24} />, color: '#10b981', status: latest?.ph < 6.5 || latest?.ph > 8.5 ? 'Warning' : 'Safe' },
        { title: 'Dissolved Oxygen', value: latest?.dissolvedOxygen, unit: 'mg/L', icon: <Wind size={24} />, color: '#6366f1', status: latest?.dissolvedOxygen < 5 ? 'Warning' : 'Safe' },
        { title: 'Turbidity', value: latest?.turbidity, unit: 'NTU', icon: <Droplet size={24} />, color: '#f59e0b', status: latest?.turbidity > 25 ? 'Warning' : 'Safe' },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>System Overview</h1>
                <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Real-time water quality monitoring for {latest?.station || 'Station-01'}</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '2rem' }}>
                {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Parameter Trends</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="temperature" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                                <Area type="monotone" dataKey="dissolvedOxygen" stroke="#6366f1" strokeWidth={3} fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BrainCircuit size={20} /> Pond Advisor
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>MAINTENANCE SUGGESTION</div>
                            <div style={{ fontWeight: 600 }}>{latest?.status === 'Safe' ? 'System operating within limits' : 'Manual verification required'}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>DISEASE RISK</div>
                            <div style={{ fontWeight: 600 }}>{latest?.ph < 6.5 || latest?.dissolvedOxygen < 5 ? 'Elevated (Medium)' : 'Optimal (Low)'}</div>
                        </div>
                        <button
                            onClick={() => window.location.href = '/intelligence'}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.75rem',
                                background: 'white',
                                color: 'var(--primary)',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            View Deep Insights
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
