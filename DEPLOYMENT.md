# 🚀 Deployment Guide

This guide will help you deploy the AccioJob Component Generator to production.

## 📋 Prerequisites

- **Vercel Account** (for frontend)
- **Render/Railway Account** (for backend)
- **MongoDB Atlas Account** (for database)
- **Redis Cloud Account** (optional, for caching)
- **OpenRouter API Key** (for AI features)

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Configure Domain (Optional)
- Go to your Vercel dashboard
- Select your project
- Go to Settings > Domains
- Add your custom domain

## 📡 Backend Deployment (Render)

### 1. Prepare Environment Variables
Set these in your Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accio-job
JWT_SECRET=your-super-secret-jwt-key
OPENROUTER_API_KEY=your-openrouter-api-key
AI_MODEL=anthropic/claude-3.5-sonnet
FRONTEND_URL=https://your-frontend-url.vercel.app
REDIS_URL=redis://username:password@redis-host:port
```

### 2. Deploy to Render

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `accio-job-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Environment Variables**
   - Add all environment variables listed above
   - Set `NODE_ENV=production`

### 3. Alternative: Railway Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Choose your preferred region

### 2. Configure Network Access
1. Go to Network Access
2. Add IP Address: `0.0.0.0/0` (for production)
3. Or add specific IPs for security

### 3. Create Database User
1. Go to Database Access
2. Create a new user with read/write permissions
3. Save username and password

### 4. Get Connection String
1. Go to Clusters
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your user password

## 🔄 Redis Setup (Optional)

### Redis Cloud
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account
3. Create a new database
4. Copy the connection URL

### Update Environment Variables
Add the Redis URL to your backend environment variables.

## 🔧 Production Configuration

### 1. Update Frontend API URL
Make sure your frontend points to the correct backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### 2. CORS Configuration
Update your backend CORS settings in `server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 3. Security Headers
The application already includes:
- Helmet.js for security headers
- Rate limiting
- Input validation
- JWT authentication

## 📊 Monitoring & Logs

### Vercel (Frontend)
- Built-in analytics
- Performance monitoring
- Error tracking

### Render (Backend)
- Built-in logging
- Performance metrics
- Health checks

### MongoDB Atlas
- Database monitoring
- Query performance
- Storage usage

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL in backend environment
   - Ensure URLs match exactly

2. **Database Connection**
   - Verify MongoDB connection string
   - Check network access settings

3. **AI Generation Fails**
   - Verify OPENROUTER_API_KEY
   - Check API quota limits

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Commands

```bash
# Check backend logs
railway logs

# Check frontend build
vercel logs

# Test database connection
npm run test:db
```

## 🚀 Performance Optimization

### Frontend
- Images are optimized automatically by Next.js
- Code splitting is enabled
- Static generation where possible

### Backend
- Database indexing on frequently queried fields
- Redis caching for session data
- Rate limiting to prevent abuse

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB user has minimal required permissions
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] HTTPS is enforced
- [ ] Environment variables are secure

## 📈 Scaling Considerations

### Frontend (Vercel)
- Automatic scaling
- Global CDN
- Edge functions available

### Backend (Render)
- Auto-scaling based on traffic
- Multiple regions available
- Load balancing

### Database (MongoDB Atlas)
- Automatic backups
- Read replicas for scaling
- Sharding for large datasets

---

**Need help?** Open an issue in the GitHub repository or contact the development team. 