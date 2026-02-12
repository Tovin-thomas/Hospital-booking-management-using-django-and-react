import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DoctorLayout from './components/layout/DoctorLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Doctors from './pages/Doctors';
import Departments from './pages/Departments';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContacts from './pages/admin/AdminContacts';
import AdminLeaves from './pages/admin/AdminLeaves';

function App() {
    return (
        <Router>
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

                {/* Doctor Dashboard with DoctorLayout (separate from main Layout) */}
                <Route path="/dashboard" element={
                    <ProtectedRoute requireDoctor>
                        <DoctorLayout>
                            <Dashboard />
                        </DoctorLayout>
                    </ProtectedRoute>
                } />

                {/* Admin Panel Routes (No Layout - Uses AdminLayout internally) */}
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

                    {/* Redirect /admin to /admin/dashboard */}
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
