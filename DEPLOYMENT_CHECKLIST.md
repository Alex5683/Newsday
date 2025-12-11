# CMS Deployment & Launch Checklist

## ✅ Pre-Deployment Checklist

### Development Environment
- [x] Node.js 18+ installed
- [x] npm dependencies installed (`npm install`)
- [x] Environment variables configured in `.env.local`
- [x] MongoDB connection tested
- [x] NextAuth configuration verified
- [x] Admin user created and tested

### Code Quality
- [ ] All files properly formatted
- [ ] No console.error() left in code
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes
- [ ] No unused imports
- [ ] Comments added for complex logic

### Testing
- [ ] Admin login works
- [ ] Post creation works
- [ ] Post editing works
- [ ] Post deletion works
- [ ] Category CRUD works
- [ ] Tag CRUD works
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Public blog pages load
- [ ] SEO fields validate
- [ ] Slug generation works
- [ ] Image URLs load correctly

### Database
- [ ] MongoDB connection strings correct
- [ ] Database name set correctly
- [ ] Collections created successfully
- [ ] Indexes created for performance
- [ ] Backup strategy planned
- [ ] Test data ready

### Security
- [ ] AUTH_SECRET is strong and unique
- [ ] Google OAuth credentials configured
- [ ] MONGODB_URI uses strong password
- [ ] No secrets in code
- [ ] No hardcoded API keys
- [ ] CORS properly configured
- [ ] All admin routes protected

## 🚀 Deployment Steps

### 1. Prepare Production Database

```bash
# Create backup of development database
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/newsday" --out ./backup

# Create production database
# In MongoDB Atlas dashboard:
# 1. Create new database in production cluster
# 2. Set up database user with strong password
# 3. Configure IP whitelist (Vercel IPs)
# 4. Get connection string
```

### 2. Configure Production Environment

Create `.env.production.local` or set on hosting platform:

```env
# Database
MONGODB_URI=mongodb+srv://prod_user:strong_password@prod-cluster.mongodb.net/newsday

# Authentication
AUTH_SECRET=generate_new_strong_secret_here
AUTH_GOOGLE_ID=your_production_google_id
AUTH_GOOGLE_SECRET=your_production_google_secret

# Next.js
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### 3. Build & Test Locally

```bash
# Build the application
npm run build

# Check for build errors
# Should see: "Route (group) ✓"

# Run production build locally
npm start

# Test in production mode
# Try admin panel and blog pages
```

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Connect to GitHub repo (if using)
# - Link to project
# - Set environment variables
# - Deploy
```

**Or use GitHub integration:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Vercel auto-deploys on push

### 5. Post-Deployment Configuration

#### MongoDB Atlas Setup
```
1. Go to MongoDB Atlas Dashboard
2. Network Access:
   - Add IP Address
   - Allow Vercel IPs (34.64.4.0/22, etc.)
3. Database Access:
   - Create production user
   - Set strong password
4. Backups:
   - Enable daily backups
   - Set retention period
```

#### Vercel Configuration
```
1. Project Settings
   - Set domains
   - Configure redirects
   - Set build command: npm run build
   - Set start command: npm start
2. Environment Variables
   - Add all production variables
   - Protect sensitive variables
3. Analytics
   - Enable Web Analytics
   - Set up error tracking
```

### 6. Verify Deployment

```bash
# Test production URL
curl https://yourdomain.com/admin/cms

# Check API endpoints
curl https://yourdomain.com/api/cms/posts

# Verify database connection
# Create test post in admin panel
# Check if it appears in blog
```

## 📋 Post-Deployment Checklist

### Functionality
- [ ] Admin panel accessible at `/admin/cms`
- [ ] Can create posts
- [ ] Can edit posts
- [ ] Can delete posts
- [ ] Can manage categories
- [ ] Can manage tags
- [ ] Public blog accessible at `/blog`
- [ ] Search functionality works
- [ ] Filters work
- [ ] Pagination works

### Performance
- [ ] Pages load in < 2 seconds
- [ ] API responds in < 500ms
- [ ] Images load correctly
- [ ] Database queries optimized
- [ ] No 404 errors in console

### Security
- [ ] HTTPS enabled
- [ ] No console errors
- [ ] No sensitive data exposed
- [ ] Admin routes protected
- [ ] Database credentials secure
- [ ] CORS properly configured

### SEO & Metadata
- [ ] Meta tags rendering correctly
- [ ] Open Graph tags present
- [ ] Sitemap.xml accessible
- [ ] robots.txt configured
- [ ] Canonical URLs set

### Monitoring & Analytics
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Database monitoring active
- [ ] Uptime monitoring enabled
- [ ] Alerts configured

## 🔄 Maintenance Schedule

### Daily
- [ ] Monitor error logs
- [ ] Check application health
- [ ] Monitor database performance

### Weekly
- [ ] Review analytics
- [ ] Check user feedback
- [ ] Test backup restoration

### Monthly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Optimize database
- [ ] Archive old logs

### Quarterly
- [ ] Full security audit
- [ ] Performance review
- [ ] Update documentation
- [ ] Plan new features

## 🚨 Rollback Plan

### If Deployment Fails

```bash
# Option 1: Revert to previous version
git revert HEAD
npm run build
vercel --prod

# Option 2: Use Vercel dashboard
# Deployments tab → Select previous version → Promote to Production

# Option 3: Restore from backup
mongorestore --uri "mongodb+srv://..." ./backup
```

## 📞 Monitoring & Alerts

### Set Up Alerts For:
- Application errors (5+ per hour)
- Database connection failures
- High API latency (> 1 second)
- High memory usage (> 80%)
- Disk space critical (> 90%)

### Recommended Tools:
- **Error Tracking:** Sentry, LogRocket
- **Uptime Monitoring:** Uptime Robot, Pingdom
- **Performance:** Vercel Analytics, DataDog
- **Database:** MongoDB Cloud Alerts

## 📊 Success Metrics

Track these metrics post-launch:

```
Performance:
├─ Page Load Time: < 2s (target)
├─ API Response Time: < 500ms (target)
├─ Time to First Byte: < 600ms (target)
└─ Core Web Vitals: All green

Reliability:
├─ Uptime: > 99.9% (target)
├─ Error Rate: < 0.1% (target)
├─ Database Availability: > 99.95% (target)
└─ Deployment Success Rate: 100%

Usage:
├─ Monthly Active Users
├─ Posts Created
├─ Page Views
└─ Avg Session Duration
```

## 🎓 Documentation Links

For detailed information, refer to:

1. **README_CMS.md** - Overview and features
2. **CMS_QUICKSTART.md** - Initial setup
3. **CMS_DOCUMENTATION.md** - Complete reference
4. **CMS_ARCHITECTURE.md** - System design
5. **CMS_CONFIG_REFERENCE.md** - Configuration guide

## ⚠️ Important Notes

### Before Going Live
1. **Data Migration** - Migrate content if needed
2. **Backups** - Ensure backup system is working
3. **DNS** - Update DNS if using custom domain
4. **SSL** - Verify HTTPS certificate
5. **Email** - Configure admin notifications

### Security Reminders
1. Never commit `.env.local` to version control
2. Use strong, unique passwords
3. Enable 2FA on MongoDB Atlas
4. Regularly update dependencies
5. Monitor security advisories

### Performance Tips
1. Enable CDN for static assets
2. Use database connection pooling
3. Implement caching strategies
4. Monitor and optimize queries
5. Regular database maintenance

## 🎉 Launch Day Checklist

```
Day Before:
- [ ] Final testing complete
- [ ] Backups verified
- [ ] Team notified
- [ ] Rollback plan ready

Launch Day:
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Test all features
- [ ] Check analytics
- [ ] Announce to users

After Launch:
- [ ] Gather feedback
- [ ] Monitor performance
- [ ] Fix any issues
- [ ] Update documentation
- [ ] Plan next improvements
```

## 📞 Support & Troubleshooting

### Common Issues

**Connection Timeout**
```
→ Check MongoDB IP whitelist
→ Verify connection string
→ Check network connectivity
→ Restart application
```

**Authentication Error**
```
→ Verify AUTH_SECRET
→ Check Google OAuth credentials
→ Clear browser cookies
→ Check session storage
```

**Database Error**
```
→ Verify MONGODB_URI
→ Check user permissions
→ Review error logs
→ Check database status
```

### Emergency Contacts
- MongoDB Support: https://support.mongodb.com
- Vercel Support: https://vercel.com/support
- NextAuth Issues: https://github.com/nextauthjs/next-auth/issues

---

## ✅ Final Sign-Off

- [ ] All tests passed
- [ ] Documentation complete
- [ ] Team trained
- [ ] Ready for launch

**Launch Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________

---

**Good luck with your launch! 🚀**

Remember: Always monitor your application after deployment!
