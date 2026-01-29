import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminRedirect from '../common/AdminRedirect';

const Layout = () => {
    return (
        <AdminRedirect>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}>
                <Navbar />
                <main style={{
                    flex: 1,
                    width: '100%',
                }}>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </AdminRedirect>
    );
};

export default Layout;
