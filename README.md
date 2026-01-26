# 🏥 Hospital Booking Management System

A modern full-stack hospital booking and management system built with **Django REST Framework** and **React**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Django](https://img.shields.io/badge/Django-6.0-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)

## 🌟 Features

### Patient Features
- ✅ User registration and authentication (JWT)
- ✅ Browse doctors by department and specialization
- ✅ View doctor profiles with availability schedules
- ✅ Book appointments with real-time slot availability
- ✅ Manage bookings (view, cancel)
- ✅ Contact form

### Doctor Features (Admin-created accounts)
- ✅ View personal appointment dashboard
- ✅ Manage appointment schedules
- ✅ Update appointment status (accept/reject)
- ✅ View patient information

### Admin Features
- ✅ Manage doctors, departments, and patients
- ✅ View system-wide statistics
- ✅ Manage all appointments
- ✅ Handle contact messages
- ✅ Doctor availability management

---

## 🛠️ Tech Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - REST API
- **Simple JWT** - Authentication
- **SQLite** - Database (development)
- **CORS Headers** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **TanStack Query** - Data fetching & caching
- **Axios** - HTTP client
- **React Toastify** - Notifications

---

## 📂 Project Structure

```
hospital-booking-management/
├── backend/                    # Django REST API
│   ├── api/                   # REST API endpoints
│   ├── doctors/               # Doctor models & admin
│   ├── bookings/              # Booking models & logic
│   ├── core/                  # Contact & utilities
│   ├── django_tutorial/       # Django settings
│   ├── uploads/               # Media files (doctor images)
│   ├── db.sqlite3            # Database
│   └── manage.py             # Django CLI
│
└── frontend/                  # React application
    ├── src/
    │   ├── api/              # API configuration
    │   ├── components/       # Reusable components
    │   ├── pages/            # Page components
    │   ├── context/          # Auth context
    │   └── App.jsx           # Main app component
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- pipenv (or pip)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pipenv install
   # OR using pip:
   pip install -r requirements.txt
   ```

3. **Activate virtual environment:**
   ```bash
   pipenv shell
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (admin):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server:**
   ```bash
   python manage.py runserver
   ```

   Backend will run at: `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will run at: `http://localhost:5173`

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/profile/` - Get user profile

### Doctors
- `GET /api/doctors/` - List all doctors
- `GET /api/doctors/{id}/` - Doctor details
- `GET /api/doctors/{id}/availability/` - Doctor's schedule
- `GET /api/doctors/{id}/available_slots/?date=YYYY-MM-DD` - Available time slots

### Departments
- `GET /api/departments/` - List all departments

### Bookings
- `GET /api/bookings/` - List bookings (filtered by user role)
- `POST /api/bookings/` - Create new booking
- `GET /api/bookings/{id}/` - Booking details
- `POST /api/bookings/{id}/update_status/` - Update status (doctor/admin)
- `POST /api/bookings/{id}/cancel/` - Cancel booking

### Dashboard
- `GET /api/dashboard/stats/` - Role-based dashboard statistics

---

## 👥 User Roles

### Patient (Default)
- Register via frontend
- Book appointments
- View own bookings

### Doctor
- Created by admin in Django admin panel
- Linked to Django User account
- Can manage their appointments

### Admin
- Full system access
- Django superuser account

---

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional medical theme
- **Responsive**: Mobile-first design
- **Real-time Updates**: TanStack Query for data synchronization
- **Smooth Animations**: CSS transitions and hover effects
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Skeleton screens and spinners

---

## 📸 Screenshots

*(Add screenshots of your application here)*

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing (Django default)
- CORS configuration for frontend-backend communication
- SQL injection protection (Django ORM)
- XSS protection

---

## 🐛 Known Issues

- Database is SQLite (not recommended for production)
- No email verification for user registration
- No payment gateway integration

---

## 🚀 Deployment

### Backend (Django)
- Use PostgreSQL or MySQL for production
- Configure `ALLOWED_HOSTS` in settings
- Set `DEBUG = False`
- Use environment variables for secrets
- Deploy on platforms like Heroku, Railway, or AWS

### Frontend (React)
- Build for production: `npm run build`
- Deploy on Vercel, Netlify, or similar
- Update API base URL for production

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Tovin Thomas**
- GitHub: [@Tovin-thomas](https://github.com/Tovin-thomas)
- Repository: [Hospital Booking Management](https://github.com/Tovin-thomas/Hospital-booking-management-using-django-and-react)

---

## 🙏 Acknowledgments

- Django REST Framework documentation
- React documentation
- TanStack Query (React Query)
- FontAwesome for icons

---

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

**Made with ❤️ using Django & React**
