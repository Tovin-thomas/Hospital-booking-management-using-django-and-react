# Frontend - React Application

## 📋 Overview

This is the React frontend for the Hospital Booking Management System. It's a modern Single Page Application (SPA) that consumes the Django REST API backend.

## 🏗️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Query + Context API
- **Forms**: React Hook Form + Yup validation
- **HTTP Client**: Axios
- **Styling**: CSS3 (modern, responsive)
- **Icons**: Heroicons
- **Notifications**: React Toastify
- **Date Handling**: date-fns

## 📁 Project Structure

```
frontend/
├── public/                      # Static assets
├── src/
│   ├── api/                    # API configuration
│   │   ├── axios.js           # Axios instance & interceptors
│   │   └── endpoints.js       # API endpoint URLs
│   │
│   ├── components/             # Reusable components
│   │   ├── common/            # Generic UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Loading.jsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   ├── doctors/           # Doctor-specific components
│   │   │   ├── DoctorCard.jsx
│   │   │   └── DoctorList.jsx
│   │   └── bookings/          # Booking-specific components
│   │       ├── BookingCard.jsx
│   │       └── TimeSlotPicker.jsx
│   │
│   ├── pages/                  # Page components (routes)
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Doctors.jsx
│   │   ├── Departments.jsx
│   │   ├── Booking.jsx
│   │   ├── MyBookings.jsx
│   │   ├── Contact.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   │
│   ├── context/                # React Context providers
│   │   └── AuthContext.jsx   # Authentication context
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js        # Authentication hook
│   │   ├── useBooking.js     # Booking operations hook
│   │   └── useDoctors.js     # Doctor data hook
│   │
│   ├── utils/                  # Utility functions
│   │   ├── auth.js           # Auth helpers (token management)
│   │   ├── formatters.js     # Date/time formatters
│   │   └── validators.js     # Custom validators
│   │
│   ├── styles/                 # CSS files
│   │   ├── index.css         # Global styles
│   │   ├── variables.css     # CSS variables
│   │   └── components/       # Component-specific styles
│   │
│   ├── App.jsx                 # Main App component
│   ├── main.jsx                # Entry point
│   └── routes.jsx              # Route definitions
│
├── .env                        # Environment variables
├── .env.example                # Environment template
├── .gitignore
├── index.html
├── package.json
├── vite.config.js             # Vite configuration
└── README.md                  # This file
```

## 🚀 Setup Instructions

### 1. Initialize React App

```bash
cd frontend
npm create vite@latest . --template react
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install

# Routing
npm install react-router-dom

# API & Data Fetching
npm install axios @tanstack/react-query

# Forms & Validation
npm install react-hook-form @hookform/resolvers yup

# UI & UX
npm install @headlessui/react @heroicons/react
npm install react-toastify

# Utilities
npm install date-fns jwt-decode
```

### 3 Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Hospital Booking System
```

### 4. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

## 🎨 Design System

### Color Palette

```css
:root {
  /* Primary Colors */
  --color-primary: #3b82f6;      /* Blue */
  --color-primary-dark: #2563eb;
  --color-primary-light: #60a5fa;
  
  /* Secondary Colors */
  --color-secondary: #10b981;    /* Green */
  --color-secondary-dark: #059669;
  --color-secondary-light: #34d399;
  
  /* Status Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Spacing */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### Typography Scale

- **Headings**: 
  - H1: 2.5rem (40px) - Page titles
  - H2: 2rem (32px) - Section titles
  - H3: 1.5rem (24px) - Subsection titles
  - H4: 1.25rem (20px) - Card titles
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)
- **Tiny**: 0.75rem (12px)

## 🔐 Authentication

### Token Management

Tokens are stored in `localStorage`:
- `access_token` - Short-lived access token
- `refresh_token` - Long-lived refresh token

### Auth Flow

```javascript
// Login
const login = async (credentials) => {
  const response = await axios.post('/auth/login/', credentials);
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  return response.data;
};

// Logout
const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Auto-refresh token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      // ... refresh logic
    }
    return Promise.reject(error);
  }
);
```

## 🛣️ Routes

| Path | Component | Protected | Description |
|------|-----------|-----------|-------------|
| `/` | Home | No | Landing page |
| `/about` | About | No | About hospital |
| `/doctors` | Doctors | No | Browse doctors |
| `/departments` | Departments | No | View departments |
| `/booking/:doctorId` | Booking | Yes | Book appointment |
| `/my-bookings` | MyBookings | Yes | View user bookings |
| `/dashboard` | Dashboard | Yes | User dashboard |
| `/contact` | Contact | No | Contact form |
| `/login` | Login | No | User login |
| `/register` | Register | No | User registration |

## 📦 Key Features

### 1. Doctor Browsing
- Search by name or specialization
- Filter by department
- View doctor availability
- Check leave dates

### 2. Appointment Booking
- Select doctor
- Choose date (checks availability)
- Pick time slot (15-minute intervals)
- Provide patient information
- Confirmation & booking

### 3. Booking Management
- View all bookings
- Filter by status
- Cancel bookings
- View booking details

### 4. Dashboard (Role-based)
- **Patient**: Upcoming appointments, booking stats
- **Doctor**: Today's appointments, pending approvals
- **Admin**: System statistics, manage bookings

### 5. Contact Form
- Submit inquiries
- Email validation
- Success notifications

## 🎯 Component Examples

### Button Component

```jsx
function Button({ children, variant = 'primary', onClick, disabled, ...props }) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Protected Route

```jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}
```

## 🔧 Configuration

### Vite Config

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

Build output will be in `dist/` directory.

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## ♿ Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## 🐛 Troubleshooting

### API Connection Issues

Check:
1. Backend is running (`http://localhost:8000`)
2. CORS is configured correctly
3. `.env` has correct API URL
4. Network tab in browser DevTools

### Authentication Issues

- Clear localStorage
- Check token expiry
- Verify JWT configuration in backend

### Build Issues

```bash
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

## ✅ Development Checklist

- [ ] Initialize Vite + React
- [ ] Install dependencies
- [ ] Set up folder structure
- [ ] Configure Axios & API endpoints
- [ ] Create AuthContext
- [ ] Set up React Router
- [ ] Build layout components
- [ ] Create common UI components
- [ ] Build page components
- [ ] Implement authentication
- [ ] Connect to backend API
- [ ] Add error handling
- [ ] Optimize performance
- [ ] Test all features
- [ ] Build for production

---

**React Frontend Ready** ⚛️
