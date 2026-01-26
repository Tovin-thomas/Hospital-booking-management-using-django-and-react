# Backend - Django REST API

## 📋 Overview

This is the Django REST Framework API backend for the Hospital Booking Management System. It provides RESTful API endpoints with JWT authentication for the React frontend.

## 🏗️ Architecture

- **Framework**: Django + Django REST Framework
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite (can be upgraded to PostgreSQL/MySQL)
- **API Documentation**: Django REST Framework browsable API

## 📁 Structure

```
backend/
├── manage.py
├── Pipfile / Pipfile.lock      # Dependencies
├── requirements.txt             # Alternative dependencies file
├── db.sqlite3                   # Database
│
├── django_tutorial/             # Main project settings
│   ├── settings.py             # Django configuration
│   ├── urls.py                 # Main URL routing
│   └── wsgi.py                 # WSGI application
│
├── api/                         # API app (NEW)
│   ├── serializers.py          # Data serializers
│   ├── views.py                # API views/viewsets
│   ├── urls.py                 # API routing
│   └── permissions.py          # Custom permissions
│
├── bookings/                    # Booking models & logic
├── doctors/                     # Doctor models & logic
├── core/                        # Core models (Contact, etc.)
├── accounts/                    # User account models
└── custom_admin/                # Admin dashboard logic
```

## 🚀 Setup Instructions

### 1. Install Dependencies

Using Pipenv (recommended):
```bash
cd backend
pipenv install
pipenv shell
```

Or using pip:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Database (optional - if using PostgreSQL)
# DATABASE_URL=postgresql://user:password@localhost:5432/hospital_db
```

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser

```bash
python manage.py createsuperuser
```

### 5. Run Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/` - Update user profile

### Departments

- `GET /api/departments/` - List all departments
- `GET /api/departments/{id}/` - Get department details

### Doctors

- `GET /api/doctors/` - List all doctors
- `GET /api/doctors/{id}/` - Get doctor details
- `GET /api/doctors/{id}/availability/` - Get doctor's availability schedule
- `GET /api/doctors/{id}/leaves/` - Get doctor's leave dates
- `GET /api/doctors/{id}/available_slots/?date=YYYY-MM-DD` - Get available time slots

### Bookings

- `GET /api/bookings/` - List user's bookings (filtered by role)
- `POST /api/bookings/` - Create new booking
- `GET /api/bookings/{id}/` - Get booking details
- `PUT /api/bookings/{id}/` - Update booking
- `DELETE /api/bookings/{id}/` - Delete booking
- `POST /api/bookings/{id}/update_status/` - Update booking status (doctor/admin)
- `POST /api/bookings/{id}/cancel/` - Cancel booking (owner/admin)

### Contact

- `POST /api/contacts/` - Submit contact message
- `GET /api/contacts/` - List all contact messages (admin only)
- `POST /api/contacts/{id}/mark_read/` - Mark message as read (admin only)

### Dashboard

- `GET /api/dashboard/stats/` - Get dashboard statistics (role-based)

## 🔐 Authentication Flow

1. **Register**: `POST /api/auth/register/` with user details
2. **Login**: `POST /api/auth/login/` with credentials
3. **Response**: Receive `access` and `refresh` tokens
4. **Use Token**: Include in headers: `Authorization: Bearer {access_token}`
5. **Refresh**: Use `refresh` token to get new `access` token

## 🛡️ Permissions

- **AllowAny**: Public endpoints (register, login, contact form)
- **IsAuthenticated**: Logged-in users (bookings, profile)
- **IsOwnerOrAdmin**: Owner of resource or admin
- **IsDoctorOrAdmin**: Doctor or admin users
- **IsAdminUser**: Admin only (contact management)

## 🔧 Configuration Details

### CORS Settings

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # Create React App
    "http://localhost:5173",    # Vite
]
CORS_ALLOW_CREDENTIALS = True
```

### JWT Settings

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

### REST Framework Settings

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}
```

## 📊 Models

All models from the original Django app are preserved:

- **User** (Django's built-in)
- **Departments** - Hospital departments
- **Doctors** - Doctor profiles
- **DoctorAvailability** - Working hours by day
- **DoctorLeave** - Leave dates
- **Booking** - Appointment bookings
- **Contact** - Contact form messages

## 🔍 Testing the API

### Using Django REST Framework Browsable API

Visit `http://localhost:8000/api/` in your browser to explore the API interactively.

### Using cURL

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"SecurePass123","password2":"SecurePass123","first_name":"John","last_name":"Doe"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"SecurePass123"}'

# List doctors
curl http://localhost:8000/api/doctors/

# Create booking (with token)
curl -X POST http://localhost:8000/api/bookings/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"doctor_id":1,"booking_date":"2026-02-01","appointment_time":"10:00","p_name":"John Doe","p_phone":"1234567890","p_email":"john@example.com"}'
```

### Using Postman

Import the API endpoints into Postman and test each one. Remember to include the Bearer token for protected endpoints.

## 📝 Development Notes

### Adding New Endpoints

1. Create serializer in `api/serializers.py`
2. Create view/viewset in `api/views.py`
3. Add URL pattern in `api/urls.py`
4. Set appropriate permissions

### Database Management

```bash
# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Shell
python manage.py shell

# Database shell
python manage.py dbshell
```

### Static Files (for admin)

```bash
python manage.py collectstatic
```

## 🐛 Troubleshooting

### CORS Issues

If frontend can't connect, check:
1. CORS_ALLOWED_ORIGINS in settings.py
2. Frontend URL matches allowed origins
3. CORS middleware is in MIDDLEWARE list

### JWT Token Issues

- Check token expiry settings
- Verify token is sent in header correctly
- Ensure token refresh logic is working

### Database Issues

```bash
# Reset database (WARNING: deletes all data)
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## 📚 Resources

- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [Simple JWT  Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)

## ✅ Next Steps

1. ✅ Install dependencies
2. ✅ Configure settings
3. ✅ Run migrations
4. ⏳ Create API app
5. ⏳ Write serializers
6. ⏳ Create API views
7. ⏳ Test endpoints
8. ⏳ Connect with React frontend

---

**Backend API Server Running** 🚀
