import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, History, BarChart3, LogOut, Waves, BrainCircuit, Database, MonitorPlay, Search, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/digital-twin', icon: <MonitorPlay size={20} />, label: 'Digital Twin' },
        { path: '/intelligence', icon: <BrainCircuit size={20} />, label: 'Pond Insights' },
        { path: '/alerts', icon: <AlertTriangle size={20} />, label: 'Alerts' },
        { path: '/history', icon: <History size={20} />, label: 'History' },
        { path: '/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
        { path: '/dataset', icon: <Database size={20} />, label: 'Datasets' },
        { path: '/data-query', icon: <Search size={20} />, label: 'Data Query' },
        { path: '/fish-gallery', icon: <Image size={20} />, label: 'Fish Gallery' },
    ];

    return (
        <aside style={{
            width: '260px',
            background: 'var(--card)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'sticky',
            top: 0
        }}>
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                <Waves size={32} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>AquaWatch</h1>
            </div>

            <nav style={{ flex: 1, padding: '1rem' }}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '0.5rem',
                            color: isActive ? 'white' : 'var(--muted)',
                            background: isActive ? 'var(--primary)' : 'transparent',
                            transition: 'all 0.2s'
                        })}
                    >
                        {item.icon}
                        <span style={{ fontWeight: 500 }}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                    }}>
                        {user?.name?.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{user?.role}</div>
                    </div>
                </div>

                {user?.apiKey && (
                    <div style={{ 
                        margin: '0 1rem 1rem 1rem', 
                        padding: '0.75rem', 
                        background: '#f0f9ff', 
                        borderRadius: '8px', 
                        border: '1px solid #bae6fd',
                        fontSize: '0.7rem' 
                    }}>
                        <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.6rem', textTransform: 'uppercase' }}>Your API Key</div>
                        <code style={{ wordBreak: 'break-all', color: '#0369a1', cursor: 'pointer' }} onClick={() => {
                            navigator.clipboard.writeText(user.apiKey);
                            alert('API Key copied to clipboard!');
                        }} title="Click to copy">
                            {user.apiKey}
                        </code>
                    </div>
                )}
                <button
                    onClick={logout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius)',
                        color: '#ef4444',
                        background: '#fee2e2',
                        fontWeight: 600
                    }}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
