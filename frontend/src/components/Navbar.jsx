import React from 'react';
import { Search, Bell, Settings, Info } from 'lucide-react';

const Navbar = () => {
    return (
        <header style={{
            height: '70px',
            background: 'var(--card)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search stations..."
                        style={{
                            width: '100%',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            borderRadius: '30px',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button style={{ color: 'var(--muted)', position: 'relative' }}>
                    <Bell size={22} />
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }}></span>
                </button>
                <button style={{ color: 'var(--muted)' }}><Settings size={22} /></button>
                <button style={{ color: 'var(--muted)' }}><Info size={22} /></button>
            </div>
        </header>
    );
};

export default Navbar;
