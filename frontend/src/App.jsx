import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Alerts from './pages/Alerts';
import History from './pages/History';
import Reports from './pages/Reports';
import Intelligence from './pages/Intelligence';
import Dataset from './pages/Dataset';
import Register from './pages/Register';
import DigitalTwin from './pages/DigitalTwin';
import Chatbot from './components/Chatbot';
import DataQuery from './pages/DataQuery';
import FishGallery from './pages/FishGallery';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const AppLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ padding: '2rem', flex: 1 }}>
                    {children}
                </main>
            </div>
            <Chatbot />
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Dashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/alerts" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Alerts />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <History />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Reports />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/intelligence" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Intelligence />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/dataset" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Dataset />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/digital-twin" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <DigitalTwin />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/data-query" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <DataQuery />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/fish-gallery" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <FishGallery />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
