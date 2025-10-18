# 🚀 Kitchen Kontrol - Render.com Deployment Guide

## Quick Start (5 Minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: Production-ready ChiaroscuroCSS deployment"
git push origin main
```

### 2. Deploy on Render
1. Go to https://dashboard.render.com
2. Click **"New+"** → **"Blueprint"**
3. Connect your GitHub repo: `rubyrayjuntos/kitchen-kontrol`
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

### 3. Set Environment Variables

#### Backend Service (kitchen-kontrol-backend):
Navigate to backend service → **Environment** tab:

```
JWT_SECRET = [Generate 32+ character random string]
NODE_ENV = production
PORT = 3002
FRONTEND_URL = [Your frontend URL from Render]
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Database Connection:
✅ Render automatically sets `DATABASE_URL` when you link PostgreSQL service

---

## 📋 Environment Variables Reference

### Required Variables:

| Variable | Service | Value | Notes |
|----------|---------|-------|-------|
| `DATABASE_URL` | Backend | Auto-generated | Render sets this |
| `JWT_SECRET` | Backend | Random 32+ chars | Use crypto.randomBytes |
| `NODE_ENV` | Backend | `production` | Already in render.yaml |
| `PORT` | Backend | `3002` | Already in render.yaml |
| `FRONTEND_URL` | Backend | `https://your-frontend.onrender.com` | For CORS |

### Optional (for enhanced features):
| Variable | Service | Purpose |
|----------|---------|---------|
| `LOG_LEVEL` | Backend | Set to `error` or `warn` for production |
| `SESSION_SECRET` | Backend | For session management |
| `SENTRY_DSN` | Backend | Error tracking |

---

## 🔗 Linking Services

### Automatic Configuration:
Render.yaml already defines the relationships, but verify:

1. **Database → Backend**: Automatically linked via `DATABASE_URL`
2. **Backend → Frontend**: You must set `REACT_APP_API_URL` in frontend build settings

### Frontend Environment:
Add to Frontend service → **Environment** tab:
```
REACT_APP_API_URL = https://kitchen-kontrol-backend.onrender.com
```

---

## ⏱️ Deployment Timeline

| Step | Time | Status |
|------|------|--------|
| Git push | 1 min | ⏳ |
| Render build starts | 2 min | ⏳ |
| Database provisioning | 2-3 min | ⏳ |
| Backend build (Docker) | 3-5 min | ⏳ |
| Frontend build | 2-3 min | ⏳ |
| Migrations run | 1 min | ⏳ |
| **Total** | **10-15 min** | 🚀 |

---

## ✅ Post-Deployment Verification

### 1. Check Database
```bash
# In Render dashboard → PostgreSQL service → Shell
\dt  # List tables
SELECT COUNT(*) FROM users;  # Should see seeded data
```

### 2. Test Backend
```bash
curl https://kitchen-kontrol-backend.onrender.com/api/health
# Should return: {"status":"ok"}
```

### 3. Test Frontend
1. Visit your frontend URL
2. Try logging in (use seeded user from scripts/seed-pg.js)
3. Switch themes (palette icon in navbar)
4. Check all navigation links work

### 4. Check Logs
- Backend: Render dashboard → Backend service → **Logs**
- Look for migration success messages
- Verify no errors on startup

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to database"
**Fix**: Ensure DATABASE_URL is set (should be automatic)
```bash
# Check in backend service → Environment
echo $DATABASE_URL  # Should show postgres://...
```

### Issue: "JWT_SECRET not defined"
**Fix**: Set JWT_SECRET in backend environment variables
```bash
# Generate one:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: "CORS error when calling API"
**Fix**: Set FRONTEND_URL in backend environment
```
FRONTEND_URL=https://your-frontend.onrender.com
```

### Issue: "Migrations failed"
**Fix**: Check migration logs, might need manual run:
```bash
# In backend shell:
npm run migrate:up
npm run seed:pg
```

### Issue: "Frontend can't reach backend"
**Fix**: Set REACT_APP_API_URL and rebuild frontend
```
REACT_APP_API_URL=https://kitchen-kontrol-backend.onrender.com
```

---

## 🔒 Security Checklist

- [x] `.env` in `.gitignore`
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] CORS configured for your domain only
- [ ] Database credentials not in code
- [ ] HTTPS enforced (Render does this automatically)
- [ ] Consider adding rate limiting
- [ ] Consider adding Helmet.js for security headers

---

## 💰 Render Pricing (Starter Plan)

| Service | Plan | Cost/month |
|---------|------|------------|
| PostgreSQL | Starter | $7 |
| Backend (Web Service) | Starter | $7 |
| Frontend (Static Site) | Free | $0 |
| **Total** | | **$14/month** |

**Free tier**: Render offers $0 static sites, so frontend is free!

---

## 🎯 Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Add CNAME record: `kitchen-kontrol.yourdomain.com`
   - Configure in Render dashboard

2. **Monitor performance**
   - Check Render metrics dashboard
   - Watch for slow queries
   - Monitor memory usage

3. **Set up backups**
   - Render PostgreSQL includes automatic backups
   - Consider exporting important data weekly

4. **Add monitoring**
   - Set up Sentry for error tracking
   - Add Uptime monitoring (UptimeRobot free tier)
   - Configure email alerts in Render

5. **Document for users**
   - Create user guide
   - Add help tooltips
   - Make demo video

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status Page**: https://status.render.com

---

## 🎊 You're Ready!

Everything is configured and ready to deploy. Your app will be live in ~15 minutes after pushing to GitHub!

**Your URLs will be:**
- Backend: `https://kitchen-kontrol-backend.onrender.com`
- Frontend: `https://kitchen-kontrol-frontend.onrender.com`

**Good luck! 🚀**
