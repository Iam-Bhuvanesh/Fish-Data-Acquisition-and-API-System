import React, { useState } from 'react';
import { Search, Database, Loader2, Sparkles, TrendingUp, Droplets, AlertCircle } from 'lucide-react';
import api from '../api/api';

const DataQuery = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const suggestions = [
        { text: "Show turbidity per station", icon: <Sparkles size={14} /> },
        { text: "Average temperature analysis", icon: <TrendingUp size={14} /> },
        { text: "Highest Nitrate readings", icon: <Droplets size={14} /> },
        { text: "Stations with PH above 6", icon: <Sparkles size={14} /> }
    ];

    const handleSearch = async (text = query) => {
        const searchText = text.trim();
        if (!searchText) return;

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const { data } = await api.post('/data-query', { query: searchText });
            setResults(data);
        } catch (err) {
            console.error("Query Error:", err);
            setError(err.response?.data?.error || "Failed to fetch data from AWS Data Lake.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Database size={28} /> Pond Data Explorer
                </h1>
                <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Query your pond environment data using natural language.</p>
            </div>

            {/* Search Section */}
            <div style={{ 
                background: 'white', 
                padding: '2.5rem', 
                borderRadius: '24px', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                border: '1px solid var(--border)',
                marginBottom: '2rem'
            }}>
                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Ask about pond data... (e.g., 'Show turbidity per station')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        style={{
                            width: '100%',
                            padding: '1.2rem 1.5rem',
                            paddingRight: '4rem',
                            borderRadius: '16px',
                            border: '2px solid #e2e8f0',
                            fontSize: '1.1rem',
                            outline: 'none',
                            transition: 'all 0.3s',
                            background: '#f8fafc'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button 
                        onClick={() => handleSearch()}
                        disabled={loading || !query.trim()}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            bottom: '8px',
                            padding: '0 1.5rem',
                            borderRadius: '12px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                        Search
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)', alignSelf: 'center', marginRight: '0.5rem' }}>Try:</span>
                    {suggestions.map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => { setQuery(s.text); handleSearch(s.text); }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                background: 'white',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                color: 'var(--primary)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)'; }}
                        >
                            {s.icon} {s.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ 
                    padding: '1rem 1.5rem', 
                    background: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    color: '#dc2626', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '2rem'
                }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Results Section */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--muted)', fontWeight: 500 }}>Executing Athena Query on AWS Data Lake...</p>
                </div>
            )}

            {results && results.data.length > 0 && (
                <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Query Results ({results.data.length})</h2>
                        <code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#64748b' }}>
                            SQL: {results.sql}
                        </code>
                    </div>

                    {/* Check if analytical result (e.g. Group By) or row-based */}
                    {results.data[0].avg_val !== undefined ? (
                        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Station</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Average Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.data.map((row, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>{row.station || 'Unknown'}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--primary)' }}>{parseFloat(row.avg_val).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {results.data.map((item, idx) => (
                                <div key={idx} style={{ 
                                    background: 'white', 
                                    borderRadius: '20px', 
                                    overflow: 'hidden', 
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.2s'
                                }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ height: '180px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                            <Droplets size={48} />
                                        </div>
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.92)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                                            Temp: {parseFloat(item.temp || item.temperature).toFixed(1)}°C
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.25rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.station || 'Observation'}</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                                            <span>🧪 pH {item.ph}</span>
                                            <span>📉 Turb: {item.turbidity}</span>
                                            <span>☢️ Nit: {item.nitrate}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                                            Date: {item.date}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {results && results.data.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
                    <p>No data found matching your query.</p>
                </div>
            )}

            {!results && !loading && !error && (
                <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.5 }}>
                    <Database size={64} strokeWidth={1} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                    <p>Enter a query above to start exploring the AWS Data Lake.</p>
                </div>
            )}
        </div>
    );
};

export default DataQuery;
