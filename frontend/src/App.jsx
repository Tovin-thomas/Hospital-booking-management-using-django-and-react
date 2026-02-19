import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DoctorLayout from './components/layout/DoctorLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

// Lazy load all pages - only loads code when the page is visited
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Doctors = lazy(() => import('./pages/Doctors'));
const Departments = lazy(() => import('./pages/Departments'));
const Booking = lazy(() => import('./pages/Booking'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Admin pages (heaviest - benefit most from lazy loading)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDoctors = lazy(() => import('./pages/admin/AdminDoctors'));
const AdminDepartments = lazy(() => import('./pages/admin/AdminDepartments'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminLeaves = lazy(() => import('./pages/admin/AdminLeaves'));

// Simple loading spinner for page transitions
const PageLoader = () => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: '1.125rem', color: '#64748b'
    }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '40px', height: '40px', border: '3px solid #e2e8f0',
                borderTop: '3px solid #3b82f6', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
            }} />
            Loading...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

function App() {
    return (
        <Router>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public Routes with Layout */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="doctors" element={<Doctors />} />
                        <Route path="departments" element={<Departments />} />
                        <Route path="contact" element={<Contact />} />

                        {/* Auth Routes - Redirect to dashboard if already logged in */}
                        <Route path="login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="register" element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        } />

                        {/* Protected Patient Routes */}
                        <Route path="booking/:doctorId" element={
                            <ProtectedRoute>
                                <Booking />
                            </ProtectedRoute>
                        } />
                        <Route path="my-bookings" element={
                            <ProtectedRoute>
                                <MyBookings />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Admin Login - Standalone (No Layout) */}
                    <Route path="/admin-login" element={
                        <PublicRoute>
                            <AdminLogin />
                        </PublicRoute>
                    } />

                    {/* Doctor Dashboard */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute requireDoctor>
                            <DoctorLayout>
                                <Dashboard />
                            </DoctorLayout>
                        </ProtectedRoute>
                    } />

                    {/* Admin Panel Routes */}
                    <Route path="/admin">
                        <Route path="dashboard" element={
                            <ProtectedRoute requireAdmin>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="doctors" element={
                            <ProtectedRoute requireAdmin>
                                <AdminDoctors />
                            </ProtectedRoute>
                        } />
                        <Route path="departments" element={
                            <ProtectedRoute requireAdmin>
                                <AdminDepartments />
                            </ProtectedRoute>
                        } />
                        <Route path="bookings" element={
                            <ProtectedRoute requireAdmin>
                                <AdminBookings />
                            </ProtectedRoute>
                        } />
                        <Route path="leaves" element={
                            <ProtectedRoute requireAdmin>
                                <AdminLeaves />
                            </ProtectedRoute>
                        } />
                        <Route path="users" element={
                            <ProtectedRoute requireAdmin>
                                <AdminUsers />
                            </ProtectedRoute>
                        } />
                        <Route path="contacts" element={
                            <ProtectedRoute requireAdmin>
                                <AdminContacts />
                            </ProtectedRoute>
                        } />
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
