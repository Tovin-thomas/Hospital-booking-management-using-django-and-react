# 🚀 How to Run the Hospital Booking Management App

## ⚡ Quick Start

### **1. Start Backend (Terminal 1)**
```bash
cd backend
pipenv shell
python manage.py runserver
```
✅ Backend API: http://127.0.0.1:8000/

### **2. Start Frontend (Terminal 2)**
```bash
cd frontend
npm run dev
```
✅ Frontend App: http://localhost:5173/

---

## 📦 First Time Setup

### **Backend Setup:**
```bash
cd backend

# Install dependencies
pipenv install

# Apply database migrations
pipenv shell
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### **Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔧 Alternative Backend Commands

### **If using venv instead of pipenv:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

### **If using regular Python:**
```bash
cd backend
python manage.py runserver
```

---

## 📱 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React App (Main Interface) |
| **Backend API** | http://127.0.0.1:8000/api/ | REST API Endpoints |
| **Django Admin** | http://127.0.0.1:8000/admin/ | Django Admin Panel |

---

## 🛠️ Useful Commands

### **Backend:**
```bash
# Make migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (for production)
python manage.py collectstatic

# Run tests
python manage.py test

# Open Django shell
python manage.py shell
```

### **Frontend:**
```bash
# Install new package
npm install <package-name>

# Build for production
npm run build

# Preview production build
npm run preview

# Check for linting errors
npm run lint
```

---

## ❗ Troubleshooting

### **Backend Issues:**

**Error: `ModuleNotFoundError`**
```bash
pipenv install
# or
pip install -r requirements.txt
```

**Error: `no such table`**
```bash
python manage.py migrate
```

**Error: `Port 8000 already in use`**
```bash
# Kill the process or use different port
python manage.py runserver 8001
```

### **Frontend Issues:**

**Error: `Cannot find module`**
```bash
npm install
```

**Error: `Port 5173 already in use`**
- Vite will automatically suggest another port (like 5174)

**Error: `ECONNREFUSED` when calling API**
- Make sure backend is running on port 8000

---

## 🔄 Daily Development Workflow

1. **Open 2 terminals**
2. **Terminal 1:**
   ```bash
   cd backend
   pipenv shell
   python manage.py runserver
   ```
3. **Terminal 2:**
   ```bash
   cd frontend
   npm run dev
   ```
4. **Open browser:** http://localhost:5173

---

## 📝 Notes

- Keep **both terminals running** during development
- Backend changes auto-reload (except settings.py changes)
- Frontend changes auto-reload with Hot Module Replacement (HMR)
- Use `Ctrl+C` to stop either server

---

**Last Updated:** 2026-01-29
