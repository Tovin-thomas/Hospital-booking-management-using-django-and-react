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
/**
 * Get full image URL from a relative or absolute path
 */
export const getImageUrl = (url) => {
    if (!url) return null;

    // If it's already an absolute URL (starts with http or https)
    if (url.startsWith('http')) return url;

    // If it's a data URL (base64)
    if (url.startsWith('data:')) return url;

    // Get backend base URL
    // Try VITE_MEDIA_URL first, then fallback to deriving from VITE_API_URL
    const mediaUrl = import.meta.env.VITE_MEDIA_URL;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    let baseUrl = mediaUrl ? mediaUrl.replace(/\/+$/, '') : apiUrl.replace(/\/api\/?$/, '');

    // Ensure the path starts with a slash
    const path = url.startsWith('/') ? url : `/${url}`;

    // If we're using VITE_MEDIA_URL and it already includes /media, and path also includes /media, don't double it
    if (mediaUrl && path.startsWith('/media/')) {
        baseUrl = baseUrl.replace(/\/media\/?$/, '');
    }

    return `${baseUrl}${path}`;
};
