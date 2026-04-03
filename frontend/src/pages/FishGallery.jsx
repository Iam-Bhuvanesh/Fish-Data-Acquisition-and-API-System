import React, { useState, useEffect } from 'react';
import { Search, Image, Loader2, RefreshCw } from 'lucide-react';
import api from '../api/api';

const FishGallery = () => {
    const [fishData, setFishData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [error, setError] = useState(null);

    const fetchFishImages = async (species = '') => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = species ? `/fish-images?species=${species}` : '/fish-images';
            const { data } = await api.get(endpoint);
            setFishData(data);
        } catch (err) {
            console.error('Error fetching fish images:', err);
            setError('Failed to load fish gallery. Ensure Athena table is ready.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFishImages();
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchFishImages(speciesFilter);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        Fish Species Gallery
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
                        Visual explorer for your AWS Data Lake fish metadata
                    </p>
                </div>
                <button 
                    onClick={() => fetchFishImages()}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        background: '#f1f5f9',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            {/* Filter Section */}
            <div style={{ 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '20px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: '1px solid var(--border)',
                marginBottom: '3rem',
                display: 'flex',
                gap: '1rem'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={20} />
                    <input 
                        type="text"
                        placeholder="Search by species (e.g., Tilapia)..."
                        value={speciesFilter}
                        onChange={(e) => setSpeciesFilter(e.target.value)}
                        onKeyDown={handleSearch}
                        style={{
                            width: '100%',
                            padding: '1rem 3rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            outline: 'none',
                            background: '#f8fafc'
                        }}
                    />
                </div>
                <button 
                    onClick={() => fetchFishImages(speciesFilter)}
                    style={{
                        padding: '0 2rem',
                        borderRadius: '12px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    Filter
                </button>
            </div>

            {/* Content Section */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Fetching visual data from AWS...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#fef2f2', borderRadius: '20px', border: '1px solid #fee2e2' }}>
                    <div style={{ color: '#dc2626', fontWeight: 600, fontSize: '1.1rem' }}>{error}</div>
                </div>
            ) : fishData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '10rem 0', color: 'var(--muted)' }}>
                    <Image size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                    <p>No fish images found. Try a different species!</p>
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '2.5rem',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    {fishData.map((fish, index) => (
                        <div key={index} className="gallery-card" style={{
                            background: 'white',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.07)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}>
                            <div style={{ height: '240px', overflow: 'hidden', background: '#f1f5f9' }}>
                                <img 
                                    src={fish.image_url} 
                                    alt={fish.species}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s ease'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                    }}
                                />
                            </div>
                            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ 
                                    textTransform: 'uppercase', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 700, 
                                    color: 'var(--primary)',
                                    marginBottom: '0.25rem'
                                }}>
                                    Metadata
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
                                    {fish.species}
                                </h3>
                                <div style={{ 
                                    marginTop: '0.75rem', 
                                    paddingTop: '0.75rem', 
                                    borderTop: '1px dashed var(--border)',
                                    fontSize: '0.7rem',
                                    color: 'var(--muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Image size={12} /> S3 Data Source
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .gallery-card:hover {
                    transform: translateY(-10px);
                    border-color: var(--primary);
                    box-shadow: 0 20px 25px -5px rgba(14, 165, 233, 0.1);
                }
            `}</style>
        </div>
    );
};

export default FishGallery;
