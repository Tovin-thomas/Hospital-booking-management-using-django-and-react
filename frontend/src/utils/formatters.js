import { format, parseISO } from 'date-fns';

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'MMM dd, yyyy');
    } catch (error) {
        return date;
    }
};

/**
 * Format time to readable string
 */
export const formatTime = (time) => {
    if (!time) return '';
    return time;
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (datetime) => {
    if (!datetime) return '';
    try {
        const dateObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;
        return format(dateObj, 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return datetime;
    }
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
    const colors = {
        pending: 'badge-warning',
        accepted: 'badge-success',
        rejected: 'badge-danger',
        completed: 'badge-gray',
        cancelled: 'badge-gray',
    };
    return colors[status] || 'badge-gray';
};

/**
 * Get status display text
 */
export const getStatusText = (status) => {
    const texts = {
        pending: 'Pending',
        accepted: 'Accepted',
        rejected: 'Rejected',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return texts[status] || status;
};

/**
 * Truncate text
 */
export const truncate = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};
