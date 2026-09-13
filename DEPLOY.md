# Deploy IdentityShield AI

## Step 1: Set Up MongoDB (Free Cloud)

1. Go to **https://cloud.mongodb.com**
2. Sign up / Login
3. Create a **Free M0 Cluster**
4. Go to **Database Access** → Create a database user (username + password)
5. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all)
6. Go to **Database** → Click **Connect** → **Connect your application**
7. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/identityshield?retryWrites=true&w=majority
   ```
8. Replace `<username>` and `<password>` with your DB user credentials

---

## Step 2: Deploy Backend (Render)

1. Go to **https://dashboard.render.com**
2. Sign up / Login with GitHub
3. Click **"New +"** → **"Web Service"**
4. **Connect your repo:** `shb09/IdentityShield-AI`
5. Fill in:
   - **Name:** `identityshield-api`
   - **Region:** `Oregon` (or closest)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Click **"Advanced"** → Add env vars:
   - `PYTHON_VERSION` = `3.11`
   - `MONGODB_URL` = *(paste your MongoDB connection string from Step 1)*
   - `DATABASE_NAME` = `identityshield`
7. Click **"Create Web Service"**

Wait for deploy (~2 min). Your backend URL will be:
```
https://identityshield-api.onrender.com
```

---

## Step 3: Deploy Frontend (Vercel)

1. Go to **https://vercel.com**
2. Sign up / Login with GitHub
3. Click **"Add New..."** → **"Project"**
4. **Import:** `shb09/IdentityShield-AI`
5. Framework: `Vite` (auto-detected)
6. **Root Directory:** `frontend`
7. Click **"Environment Variables"** and add:
   - Key: `VITE_API_URL`
   - Value: `https://identityshield-api.onrender.com` *(your Step 2 URL)*
8. Click **"Deploy"**

Wait for deploy (~1 min). Your frontend URL will be:
```
https://identityshield-ai.vercel.app
```

---

## Step 4: Test

1. Open your Vercel URL
2. Login with `admin` / `admin123`
3. Dashboard should show 3 demo cases
4. Try uploading a document from `backend/demo_data/`

---

## You Now Have

- **Frontend:** `https://identityshield-ai.vercel.app`
- **Backend API:** `https://identityshield-api.onrender.com`
- **API Docs:** `https://identityshield-api.onrender.com/docs`
- **Database:** MongoDB Atlas (free M0 tier)

---

## Troubleshooting

### "CORS error" on frontend
- Make sure `VITE_API_URL` is set correctly on Vercel
- Redeploy the frontend after setting the env var

### Backend is slow to respond
- Render free tier sleeps after inactivity
- First request takes ~30s to wake up
- Subsequent requests are fast

### MongoDB connection error
- Make sure `MONGODB_URL` env var is set on Render
- Check that your MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify username/password in connection string

### "Module not found" error
- Make sure Root Directory is set to `backend` on Render
- Check build log for errors

---

*IdentityShield AI — Smart India Hackathon 2026*
