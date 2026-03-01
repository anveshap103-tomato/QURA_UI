# DEPLOYMENT CHECKLIST

## ✅ Code Fixed - API URLs now use environment variables

## NEXT STEPS:

### 1. Get Your Backend URL
- Go to Render Dashboard
- Click on `qura-backend` service
- Copy the URL (e.g., `https://qura-backend-xxxx.onrender.com`)

### 2. Configure Frontend Environment Variable
- Go to your frontend service on Render
- Click **Environment** tab
- Click **Add Environment Variable**
- Key: `VITE_API_URL`
- Value: `https://qura-backend-xxxx.onrender.com` (paste your backend URL)
- Click **Save Changes**

### 3. Trigger Redeploy
- Frontend will auto-redeploy after saving env variable
- OR manually click **Manual Deploy** → **Deploy latest commit**

### 4. Wait 2-3 minutes
- Check deployment logs
- Once complete, visit your frontend URL

### 5. Test
- Login as Patient or Receptionist
- Add a patient
- Should work now!

## Troubleshooting:
- If still not working, check backend logs for errors
- Ensure backend URL has no trailing slash
- Backend should show "Live" status on Render
