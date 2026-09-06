# 🚀 Deploy IdentityShield AI — Live in 5 Minutes

## Step 1: Deploy Backend (Render) — 2 minutes

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
6. Click **"Advanced"** → Add env var:
   - Key: `PYTHON_VERSION`  Value: `3.11`
7. Click **"Create Web Service"**

Wait for deploy (~2 min). Your backend URL will be:
```
https://identityshield-api.onrender.com
```

---

## Step 2: Deploy Frontend (Vercel) — 1 minute

1. Go to **https://vercel.com**
2. Sign up / Login with GitHub
3. Click **"Add New..."** → **"Project"**
4. **Import:** `shb09/IdentityShield-AI`
5. Framework: `Vite` (auto-detected)
6. **Root Directory:** `frontend`
7. Click **"Environment Variables"** and add:
   - Key: `VITE_API_URL`
   - Value: `https://identityshield-api.onrender.com` *(your Step 1 URL)*
8. Click **"Deploy"**

Wait for deploy (~1 min). Your frontend URL will be:
```
https://identityshield-ai.vercel.app
```

---

## Step 3: Test

1. Open your Vercel URL
2. Login with `admin` / `admin123`
3. Dashboard should show 3 demo cases
4. Try uploading a document

---

## That's It! 🎉

You now have:
- **Frontend:** `https://identityshield-ai.vercel.app`
- **Backend API:** `https://identityshield-api.onrender.com`
- **API Docs:** `https://identityshield-api.onrender.com/docs`

---

## Troubleshooting

### "CORS error" on frontend
- Make sure `VITE_API_URL` is set correctly on Vercel
- Redeploy the frontend after setting the env var

### Backend is slow to respond
- Render free tier sleeps after inactivity
- First request takes ~30s to wake up
- Subsequent requests are fast

### "Module not found" error
- Make sure Root Directory is set to `backend` on Render
- Check build log for errors

---

*IdentityShield AI — Smart India Hackathon 2026*
