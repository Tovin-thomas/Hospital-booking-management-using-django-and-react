# 🚀 Deployment Steps

## Step 1: Install Production Dependencies

```bash
cd backend
pipenv install gunicorn whitenoise psycopg2-binary dj-database-url python-decouple
pipenv requirements > requirements.txt
cd ..
git add .
git commit -m "Add production dependencies"
git push
```

---

## Step 2: Create PostgreSQL Database

1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project: `hospital-booking-db`
4. Copy the PostgreSQL connection string
5. Save it (looks like: `postgresql://user:pass@host.neon.tech/dbname`)

---

## Step 3: Deploy Backend on Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click **New +** → **Web Service**
4. Connect your existing GitHub repository
5. Configure:
   - **Name**: `hospital-booking-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn django_tutorial.wsgi:application`
   - **Instance Type**: Free

6. Add Environment Variables:
   ```
   SECRET_KEY=<generate at djecrety.ir>
   DEBUG=False
   DATABASE_URL=<your-neon-postgresql-url>
   ALLOWED_HOSTS=.render.com,.onrender.com
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   PYTHON_VERSION=3.12.0
   ```

7. Click **Create Web Service**
8. Wait 5-10 minutes
9. Copy your backend URL (e.g., `https://hospital-booking-backend.onrender.com`)

---

## Step 4: Update Frontend Environment

1. Open `frontend/.env.production`
2. Update with your backend URL:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_MEDIA_URL=https://your-backend.onrender.com/media
   VITE_APP_NAME=Hospital Booking System
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
   ```
3. Save and push:
   ```bash
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push
   ```

---

## Step 5: Deploy Frontend on Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **Add New** → **Project**
4. Select your existing repository
5. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_MEDIA_URL=https://your-backend.onrender.com/media
   VITE_APP_NAME=Hospital Booking System
   VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
   ```

7. Click **Deploy**
8. Wait 2-3 minutes
9. Copy your frontend URL (e.g., `https://hospital-booking.vercel.app`)

---

## Step 6: Update CORS Settings

1. Go to Render Dashboard
2. Click your backend service
3. Go to **Environment**
4. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://your-frontend.vercel.app,http://localhost:5173
   ```
5. Click **Save Changes**
6. Wait for redeploy

---

## Step 7: Update Google OAuth

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   - `https://your-frontend.vercel.app`
6. Add to **Authorized redirect URIs**:
   - `https://your-frontend.vercel.app`
7. Click **Save**

8. Update Vercel:
   - Go to Vercel → Settings → Environment Variables
   - Update `VITE_GOOGLE_CLIENT_ID`
   - Redeploy

---

## Step 8: Test

1. Visit your frontend URL
2. Test: Register, Login, Create Booking, Google OAuth
3. Check browser console for errors (F12)

---

## ✅ Done!

Your app is live at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com/api`

---

## 🔄 To Update Later

```bash
git add .
git commit -m "Your changes"
git push
```

Both platforms auto-deploy on push!

---

## 🐛 Troubleshooting

**Backend errors**: Check Render logs  
**Frontend errors**: Check Vercel logs  
**CORS errors**: Verify CORS_ALLOWED_ORIGINS includes your Vercel URL  
**Google OAuth errors**: Check authorized origins in Google Console
