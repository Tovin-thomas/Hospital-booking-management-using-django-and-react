import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* Public Routes */}
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="doctors" element={<Doctors />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />

                    {/* Protected Routes */}
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
                    <Route path="dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
