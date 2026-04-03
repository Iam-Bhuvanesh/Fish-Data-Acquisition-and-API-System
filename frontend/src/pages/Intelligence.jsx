import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
    BrainCircuit,
    Zap,
    ShieldAlert,
    TrendingUp,
    Utensils,
    Info,
    AlertCircle,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';

const Intelligence = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('feed');

    const fetchInsights = async () => {
        try {
            const { data } = await api.get('/analytics/insights');
            setInsights(data);
        } catch (error) {
            console.error('Error fetching insights:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
        const interval = setInterval(fetchInsights, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading intelligent insights...</div>;
    if (!insights) return <div>No data available for analytics yet.</div>;

    const { feed, disease, growth, ml } = insights.insights;

    const tabs = [
        { id: 'feed', label: 'Parameter Trends', icon: <Utensils size={20} /> },
        { id: 'disease', label: 'Risk Analysis', icon: <ShieldAlert size={20} /> },
        { id: 'growth', label: 'Environmental Score', icon: <TrendingUp size={20} /> },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Pond Intelligence</h1>
                <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>AI-driven decision support for Pond Condition</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius)',
                            fontWeight: 600,
                            background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : 'var(--muted)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 350px' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    {activeTab === 'feed' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '1rem', background: '#f0f9ff', color: 'var(--primary)', borderRadius: '15px' }}>
                                    <Utensils size={32} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Parameter Distribution</h2>
                                    <p style={{ color: 'var(--muted)' }}>Precision mapping based on sensor data</p>
                                </div>
                            </div>

                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>SUGGESTED AMOUNT</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {feed.amount} <span style={{ fontSize: '1rem' }}>{feed.unit}</span>
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Zap size={24} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ fontWeight: 600 }}>{feed.suggestion}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', border: '1px dashed var(--primary)', borderRadius: 'var(--radius)', background: 'rgba(14, 165, 233, 0.05)' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                                    <Info size={18} /> Logic Insight
                                </h4>
                                <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', paddingLeft: '1.5rem' }}>
                                    <li style={{ marginBottom: '0.5rem' }}>Temperature is {insights.metrics.temperature}°C, which affects metabolic rate.</li>
                                    <li style={{ marginBottom: '0.5rem' }}>Current Dissolved Oxygen is {insights.metrics.do} mg/L, influencing appetite.</li>
                                    <li>Ammonia levels are {insights.metrics.ammonia} mg/L, affecting overall fish stress.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'disease' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{
                                    padding: '1rem',
                                    background: disease.level === 'High' ? '#fee2e2' : '#fef9c3',
                                    color: disease.level === 'High' ? '#ef4444' : '#854d0e',
                                    borderRadius: '15px'
                                }}>
                                    <ShieldAlert size={32} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Disease Risk Analysis</h2>
                                    <p style={{ color: 'var(--muted)' }}>Health vulnerability monitoring</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 600 }}>System Health Score</span>
                                    <span style={{ fontWeight: 700, color: disease.level === 'High' ? '#ef4444' : 'var(--secondary)' }}>
                                        {100 - disease.score}/100
                                    </span>
                                </div>
                                <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${100 - disease.score}%`,
                                        height: '100%',
                                        background: disease.level === 'High' ? '#ef4444' : 'var(--secondary)',
                                        transition: 'width 0.5s ease'
                                    }}></div>
                                </div>
                            </div>

                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ marginBottom: '1rem' }}>Contributing Factors</h4>
                                    {disease.factors.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#ef4444', fontSize: '0.9rem' }}>
                                            <AlertCircle size={16} /> {f}
                                        </div>
                                    ))}
                                    {disease.factors.length === 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                            <CheckCircle2 size={16} /> All parameters optimal
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius)' }}>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Prevention Guidance</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5 }}>{disease.prevention}</p>
                                    
                                    {ml && !ml.error && (
                                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>ML ENGINE PREDICTION</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <BrainCircuit size={16} />
                                                <span style={{ fontWeight: 600 }}>Health Category: {ml.ml_status}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'growth' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '1rem', background: '#f0fdf4', color: 'var(--secondary)', borderRadius: '15px' }}>
                                    <TrendingUp size={32} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Environmental Evaluation</h2>
                                            <p style={{ color: 'var(--muted)' }}>Long-term sustainability tracking</p>
                                        </div>
                                        {ml && !ml.error && (
                                            <div className="glass-card" style={{ padding: '0.5rem 1rem', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid var(--primary)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                                                ML MODEL: REGRESSION ACTIVE
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>PERFORMANCE</div>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        color: growth.performance === 'Excellent' ? 'var(--secondary)' : 'var(--accent)'
                                    }}>
                                        {growth.performance}
                                    </div>
                                </div>
                                <div style={{ width: '2px', height: '60px', background: 'var(--border)' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>GROWTH INDEX</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{growth.index}</div>
                                </div>
                                {ml && !ml.error && (
                                    <>
                                        <div style={{ width: '2px', height: '60px', background: 'var(--border)' }}></div>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>ML ML-PRED INDEX</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{ml.ml_growth_index}</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="glass-card" style={{ padding: '1.5rem', border: 'none', background: '#f8fafc' }}>
                                <h4 style={{ marginBottom: '1rem' }}>Projection Forecast</h4>
                                <p style={{ color: 'var(--muted)' }}>{growth.forecast}</p>
                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                    <button style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: 'white',
                                        border: '1px solid var(--border)',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>View Growth Curve</button>
                                    <button style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>Predict Market Ready</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Environmental Context</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--muted)' }}>Temperature</span>
                                <span style={{ fontWeight: 600 }}>{insights.metrics.temperature}°C</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--muted)' }}>pH Level</span>
                                <span style={{ fontWeight: 600 }}>{insights.metrics.ph}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--muted)' }}>Nitrate</span>
                                <span style={{ fontWeight: 600 }}>{insights.metrics.nitrate} PPM</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--muted)' }}>Ammonia</span>
                                <span style={{ fontWeight: 600 }}>{insights.metrics.ammonia} mg/L</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--muted)' }}>Manganese</span>
                                <span style={{ fontWeight: 600 }}>{insights.metrics.manganese} mg/L</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--muted)' }}>Turbidity</span>
                                <span style={{ fontWeight: 600 }}>{insights.metrics.turbidity} NTU</span>
                            </div>
                            {ml && !ml.error && (
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>ML Anomaly Detection</span>
                                    <span style={{ 
                                        fontWeight: 700, 
                                        color: ml.ml_anomaly === 'Normal' ? 'var(--secondary)' : '#ef4444' 
                                    }}>
                                        {ml.ml_anomaly}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>AI Advisor</h3>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            Based on real-time data integration, the current pond conditions are {disease.level === 'Low' ? 'optimal' : 'fluctuating'}. {feed.suggestion}. 
                            {ml && !ml.error && ` ML engine predicts ${ml.ml_status} disease risk and a growth index of ${ml.ml_growth_index}.`}
                        </p>
                        <button style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'white',
                            color: 'var(--primary)',
                            borderRadius: 'var(--radius)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            Ask AI Expert <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intelligence;
