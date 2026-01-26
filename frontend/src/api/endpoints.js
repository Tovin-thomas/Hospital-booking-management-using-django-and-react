// API endpoint constants
const API_ENDPOINTS = {
    // Authentication
    auth: {
        register: '/auth/register/',
        login: '/auth/login/',
        refresh: '/auth/refresh/',
        profile: '/auth/profile/',
    },

    // Departments
    departments: {
        list: '/departments/',
        detail: (id) => `/departments/${id}/`,
    },

    // Doctors
    doctors: {
        list: '/doctors/',
        detail: (id) => `/doctors/${id}/`,
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
        markRead: (id) => `/contacts/${id}/mark_read/`,
    },

    // Dashboard
    dashboard: {
        stats: '/dashboard/stats/',
    },
};

export default API_ENDPOINTS;
