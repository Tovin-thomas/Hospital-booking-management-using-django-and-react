# 🚀 Simple Deployment Guide

Follow these steps exactly. Copy and paste the commands.

---

## STEP 1: Install Packages (5 minutes)

Open terminal and run these commands:

```bash
cd backend
pipenv install gunicorn whitenoise psycopg2-binary dj-database-url python-decouple
pipenv requirements > requirements.txt
cd ..
git add .
git commit -m "Add production dependencies"
git push
```

✅ Done when: You see "requirements.txt" created in backend folder

---

## STEP 2: Create Database (5 minutes)

1. Open browser → Go to **neon.tech**
2. Click **Sign up** → Use GitHub
3. Click **Create a project**
4. Type name: `hospital-booking-db`
5. Click **Create**
6. You'll see a connection string like this:
   ```
   postgresql://username:password@something.neon.tech/neondb
   ```
7. **COPY THIS ENTIRE STRING** and save it in Notepad

✅ Done when: You have the database URL saved in Notepad

---

## STEP 3: Deploy Backend (10 minutes)

1. Open browser → Go to **render.com**
2. Click **Sign up** → Use GitHub
3. Click **New +** button (top right)
4. Click **Web Service**
5. Find your repository → Click **Connect**
6. Fill in these boxes:
   - **Name**: Type `hospital-backend`
   - **Root Directory**: Type `backend`
   - **Build Command**: Type `./build.sh`
   - **Start Command**: Type `gunicorn django_tutorial.wsgi:application`
   - **Free**: Select this

7. Click **Advanced** button
8. Click **Add Environment Variable** and add these one by one:

   | Name | Value |
   |------|-------|
   | `SECRET_KEY` | Go to djecrety.ir, copy the key shown |
   | `DEBUG` | Type: `False` |
   | `DATABASE_URL` | Paste the Neon URL you saved in Step 2 |
   | `ALLOWED_HOSTS` | Type: `.render.com,.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | Type: `http://localhost:5173` |
   | `PYTHON_VERSION` | Type: `3.12.0` |

9. Click **Create Web Service**
10. Wait 10 minutes (you'll see logs scrolling)
11. When it says "Live", copy the URL at the top
    - It looks like: `https://hospital-backend-abc123.onrender.com`
12. **SAVE THIS URL** in Notepad

✅ Done when: You have the backend URL saved in Notepad

---

## STEP 4: Update Frontend File (2 minutes)

1. Open file: `frontend/.env.production`
2. Replace the first line with YOUR backend URL:
   ```
   VITE_API_URL=https://hospital-backend-abc123.onrender.com/api
   ```
   (Use YOUR actual URL from Step 3)

3. Replace the second line:
   ```
   VITE_MEDIA_URL=https://hospital-backend-abc123.onrender.com/media
   ```

4. Save the file
5. Run these commands:
   ```bash
   git add frontend/.env.production
   git commit -m "Update API URL"
   git push
   ```

✅ Done when: File is saved and pushed to GitHub

---

## STEP 5: Deploy Frontend (5 minutes)

1. Open browser → Go to **vercel.com**
2. Click **Sign up** → Use GitHub
3. Click **Add New** → Click **Project**
4. Find your repository → Click **Import**
5. Fill in these boxes:
   - **Framework Preset**: Select `Vite`
   - **Root Directory**: Click Edit → Type `frontend` → Click Save
   - **Build Command**: Should show `npm run build` (leave it)
   - **Output Directory**: Should show `dist` (leave it)

6. Click **Environment Variables** section
7. Add these variables one by one:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | Paste your backend URL + `/api` |
   | `VITE_MEDIA_URL` | Paste your backend URL + `/media` |
   | `VITE_APP_NAME` | Type: `Hospital Booking System` |
   | `VITE_GOOGLE_CLIENT_ID` | Paste your Google Client ID |

   Example for first variable:
   - Name: `VITE_API_URL`
   - Value: `https://hospital-backend-abc123.onrender.com/api`

8. Click **Deploy**
9. Wait 3 minutes
10. When it says "Congratulations", copy the URL shown
    - It looks like: `https://hospital-booking-xyz.vercel.app`
11. **SAVE THIS URL** in Notepad

✅ Done when: You have the frontend URL saved in Notepad

---

## STEP 6: Connect Frontend to Backend (2 minutes)

Now we need to tell the backend to accept requests from the frontend.

1. Go back to **render.com** in your browser
2. Click on your `hospital-backend` service
3. Click **Environment** on the left side
4. Find the line that says `CORS_ALLOWED_ORIGINS`
5. Click the **Edit** button (pencil icon)
6. Change the value to include BOTH URLs separated by comma:
   ```
   https://hospital-booking-xyz.vercel.app,http://localhost:5173
   ```
   (Replace `hospital-booking-xyz.vercel.app` with YOUR Vercel URL from Step 5)

7. Click **Save Changes**
8. Wait 3 minutes (backend will restart automatically)

✅ Done when: You see "Deploy live" in Render

---

## STEP 7: Update Google Login Settings (3 minutes)

Now we need to tell Google about your new website URL.

1. Go to **console.cloud.google.com**
2. Click on your project name at the top
3. Click **APIs & Services** on the left
4. Click **Credentials**
5. Click on your **OAuth 2.0 Client ID** (the one you created before)

6. Scroll down to **Authorized JavaScript origins**
7. Click **+ ADD URI**
8. Paste your Vercel URL (from Step 5)
   - Example: `https://hospital-booking-xyz.vercel.app`
9. Click **Add**

10. Scroll down to **Authorized redirect URIs**
11. Click **+ ADD URI**
12. Paste your Vercel URL again
    - Example: `https://hospital-booking-xyz.vercel.app`
13. Click **Add**

14. Click **SAVE** at the bottom

15. Now update Vercel:
    - Go to **vercel.com**
    - Click on your project
    - Click **Settings** at the top
    - Click **Environment Variables** on the left
    - Find `VITE_GOOGLE_CLIENT_ID`
    - Click **Edit** (three dots)
    - Make sure it has your correct Google Client ID
    - Click **Save**
    - Click **Deployments** at the top
    - Click the three dots **⋯** on the first deployment
    - Click **Redeploy**
    - Click **Redeploy** again to confirm

✅ Done when: Vercel shows "Deployment completed"

---

## STEP 8: Test Your Website (5 minutes)

1. Open your Vercel URL in browser
   - Example: `https://hospital-booking-xyz.vercel.app`

2. Try these things:
   - ✅ Can you see the homepage?
   - ✅ Can you see the doctors list?
   - ✅ Can you register a new account?
   - ✅ Can you login?
   - ✅ Can you login with Google?
   - ✅ Can you create a booking?

3. If something doesn't work:
   - Press **F12** on keyboard
   - Click **Console** tab
   - Take a screenshot of any red errors
   - Check the troubleshooting section below

✅ Done when: Everything works!

---

## 🎉 FINISHED!

Your website is now live on the internet!

**Your URLs:**
- Website: `https://your-app.vercel.app`
- API: `https://your-backend.onrender.com/api`

Share your website URL with anyone!

---

## 🐛 If Something Doesn't Work

### Problem: "CORS error" in browser console
**Fix:**
- Go to render.com
- Click your backend
- Click Environment
- Make sure `CORS_ALLOWED_ORIGINS` has your Vercel URL
- Wait 3 minutes

### Problem: "Google login doesn't work"
**Fix:**
- Go to console.cloud.google.com
- Make sure you added your Vercel URL to both:
  - Authorized JavaScript origins
  - Authorized redirect URIs

### Problem: "Backend is very slow"
**Answer:** This is normal! Free tier sleeps after 15 minutes. First request takes 30 seconds to wake up. After that it's fast.

### Problem: "Can't see doctors/bookings"
**Fix:**
- The database is empty! 
- You need to add doctors through the admin panel
- Or import your old data

---

## 🔄 How to Update Your Website Later

When you make changes to your code:

```bash
git add .
git commit -m "My changes"
git push
```

Both Render and Vercel will automatically update! Wait 5 minutes.

---

## � Important Notes

- **First visit is slow**: Backend sleeps after 15 min of no activity
- **Free forever**: All platforms have free tiers
- **Auto-updates**: Push to GitHub = automatic deployment
- **HTTPS**: Automatic and free on both platforms

---

**Need help? Check the error messages in:**
- Render: Dashboard → Logs
- Vercel: Dashboard → Deployments → View Logs
- Browser: Press F12 → Console tab
