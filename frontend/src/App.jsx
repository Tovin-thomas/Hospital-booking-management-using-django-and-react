import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DoctorLayout from './components/layout/DoctorLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import AdminLayout from './components/admin/AdminLayout';

// Lazy load all pages - only loads code when the page is visited
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Doctors = lazy(() => import('./pages/Doctors'));
const Departments = lazy(() => import('./pages/Departments'));
const DepartmentDetail = lazy(() => import('./pages/DepartmentDetail'));
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
const AdminAdmins = lazy(() => import('./pages/admin/AdminAdmins'));

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

// AdminLayoutWrapper — mounts AdminLayout ONCE and renders child pages inside it.
// This is the key fix: the layout never unmounts when navigating between admin pages.
const AdminLayoutWrapper = () => (
    <AdminLayout>
        <Suspense fallback={<div style={{ padding: '2rem', color: '#64748b' }}>Loading page...</div>}>
            <Outlet />
        </Suspense>
    </AdminLayout>
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
                        <Route path="departments/:id" element={<DepartmentDetail />} />
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

                    {/* Admin Panel — single ProtectedRoute wraps entire admin section.
                         AdminLayoutWrapper mounts AdminLayout ONCE; child routes render
                         via <Outlet> without ever unmounting the sidebar/layout. */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin>
                                <AdminLayoutWrapper />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="doctors" element={<AdminDoctors />} />
                        <Route path="departments" element={<AdminDepartments />} />
                        <Route path="bookings" element={<AdminBookings />} />
                        <Route path="leaves" element={<AdminLeaves />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="contacts" element={<AdminContacts />} />
                        <Route path="admins" element={<AdminAdmins />} />
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
