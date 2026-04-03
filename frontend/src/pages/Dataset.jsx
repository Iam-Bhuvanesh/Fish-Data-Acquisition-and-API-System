import React, { useState } from 'react';
import api from '../api/api';
import { Upload, FileText, Database, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';

const Dataset = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/analytics/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: data.message });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Dataset Management</h1>
                <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Ingest historical environmental data into the system</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={20} /> Dataset Ingestion
                    </h3>

                    <form onSubmit={handleUpload}>
                        <div style={{
                            border: '2px dashed var(--border)',
                            borderRadius: '15px',
                            padding: '3rem',
                            textAlign: 'center',
                            marginBottom: '2rem',
                            background: '#f8fafc',
                            transition: 'border-color 0.2s',
                            cursor: 'pointer'
                        }}
                            onClick={() => document.getElementById('csvUpload').click()}
                        >
                            <input
                                id="csvUpload"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {file ? (
                                <div>
                                    <FileText size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                    <div style={{ fontWeight: 600 }}>{file.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{(file.size / 1024).toFixed(2)} KB</div>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={48} color="var(--muted)" style={{ marginBottom: '1rem' }} />
                                    <div style={{ fontWeight: 600 }}>Click to select CSV file</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Support for Fish Ponds.csv, Ponds.csv formats</div>
                                </div>
                            )}
                        </div>

                        {status && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius)',
                                marginBottom: '2rem',
                                background: status.type === 'success' ? '#f0fdf4' : '#fee2e2',
                                color: status.type === 'success' ? '#166534' : '#991b1b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                {status.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!file || uploading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: uploading ? 'var(--muted)' : 'var(--primary)',
                                color: 'white',
                                borderRadius: 'var(--radius)',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                cursor: (!file || uploading) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                            {uploading ? 'Processing Dataset...' : 'Start Ingestion'}
                        </button>
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Requirements</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <div style={{ background: '#f0f9ff', color: 'var(--primary)', padding: '4px', borderRadius: '50%' }}><Info size={14} /></div>
                                <div>File must be in CSV format.</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <div style={{ background: '#f0f9ff', color: 'var(--primary)', padding: '4px', borderRadius: '50%' }}><Info size={14} /></div>
                                <div>Column headers should match key parameters (Temp, pH, DO, Ammonia).</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <div style={{ background: '#f0f9ff', color: 'var(--primary)', padding: '4px', borderRadius: '50%' }}><Info size={14} /></div>
                                <div>Large datasets will be processed asynchronously.</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--secondary)', background: 'rgba(16, 185, 129, 0.05)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--secondary)' }}>Simulation Status</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                            Currently streaming random data mixed with processed historical records.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="animate-pulse" style={{ width: '10px', height: '10px', background: 'var(--secondary)', borderRadius: '50%' }}></div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Active Stream</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dataset;
