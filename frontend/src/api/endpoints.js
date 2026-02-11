// API endpoint constants
const API_ENDPOINTS = {
    // Authentication
    auth: {
        register: '/auth/register/',
        login: '/auth/login/',
        refresh: '/auth/refresh/',
        profile: '/auth/profile/',
        google: '/auth/google/',
    },

    // Departments
    departments: {
        list: '/departments/',
        create: '/departments/',
        detail: (id) => `/departments/${id}/`,
        update: (id) => `/departments/${id}/`,
        delete: (id) => `/departments/${id}/`,
    },

    // Doctors
    doctors: {
        list: '/doctors/',
        detail: (id) => `/doctors/${id}/`,
        create: '/doctors/',
        update: (id) => `/doctors/${id}/`,
        delete: (id) => `/doctors/${id}/`,
        availability: (id) => `/doctors/${id}/availability/`,
        leaves: (id) => `/doctors/${id}/leaves/`,
        availableSlots: (id, date) => `/doctors/${id}/available_slots/?date=${date}`,
    },

    // Bookings
    bookings: {
        list: '/bookings/',
        create: '/bookings/',
        detail: (id) => `/bookings/${id}/`,
        update: (id) => `/bookings/${id}/`,
        delete: (id) => `/bookings/${id}/`,
        updateStatus: (id) => `/bookings/${id}/update_status/`,
        cancel: (id) => `/bookings/${id}/cancel/`,
    },

    // Contacts
    contacts: {
        create: '/contacts/',
        list: '/contacts/',
        delete: (id) => `/contacts/${id}/`,
        markRead: (id) => `/contacts/${id}/mark_read/`,
    },

    // Users (Admin)
    users: {
        list: '/users/',
        update: (id) => `/users/${id}/`,
        delete: (id) => `/users/${id}/`,
    },

    // Doctor Schedule Management
    doctorAvailability: {
        list: '/doctor-availability/',
        create: '/doctor-availability/',
        update: (id) => `/doctor-availability/${id}/`,
        delete: (id) => `/doctor-availability/${id}/`,
    },
    doctorLeaves: {
        list: '/doctor-leaves/',
        create: '/doctor-leaves/',
        delete: (id) => `/doctor-leaves/${id}/`,
    },

    // Dashboard
    dashboard: {
        stats: '/dashboard/stats/',
    },
};

export default API_ENDPOINTS;
