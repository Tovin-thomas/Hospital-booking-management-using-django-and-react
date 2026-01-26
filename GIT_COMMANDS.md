# 🚀 Git Commands to Push to GitHub

## Step-by-Step Guide

### 1️⃣ Open Git Bash in your project folder
```bash
cd "c:/Users/HP/Desktop/django hospital booking management app"
```

### 2️⃣ Initialize Git repository
```bash
git init
```

### 3️⃣ Add remote repository
```bash
git remote add origin https://github.com/Tovin-thomas/Hospital-booking-management-using-django-and-react.git
```

### 4️⃣ Add all files to staging
```bash
git add .
```

### 5️⃣ Commit with a message
```bash
git commit -m "Initial commit: Hospital Booking Management System with Django & React"
```

### 6️⃣ Create main branch (if not already)
```bash
git branch -M main
```

### 7️⃣ Push to GitHub
```bash
git push -u origin main
```

---

## 📋 Complete Command List (Copy & Paste)

```bash
# Navigate to project
cd "c:/Users/HP/Desktop/django hospital booking management app"

# Initialize git
git init

# Add remote
git remote add origin https://github.com/Tovin-thomas/Hospital-booking-management-using-django-and-react.git

# Stage all files
git add .

# Commit
git commit -m "Initial commit: Hospital Booking Management System with Django & React"

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## ⚠️ If Repository Already Exists

If the GitHub repository already has content, use force push:

```bash
git push -u origin main --force
```

**Warning:** This will overwrite any existing content in the repository!

---

## 🔍 Verify Upload

After pushing, visit:
https://github.com/Tovin-thomas/Hospital-booking-management-using-django-and-react

You should see all your files uploaded! ✅

---

## 📝 Files That Will Be Committed

### ✅ Included:
- All source code (`backend/`, `frontend/`)
- Configuration files
- README.md
- Documentation files

### ❌ Excluded (via .gitignore):
- `node_modules/`
- `__pycache__/`
- `db.sqlite3` (database)
- `.env` files
- Virtual environments
- Compiled files
- `Django_Course/` (tutorial folder)

---

## 🎯 Next Steps After Push

1. ✅ Add repository description on GitHub
2. ✅ Add topics/tags (django, react, hospital-management, etc.)
3. ✅ Enable GitHub Pages (if you want)
4. ✅ Add a LICENSE file
5. ✅ Add screenshots to README

---

**Your code is ready to be pushed! 🚀**
