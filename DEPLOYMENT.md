# 🚀 Deployment Guide - Mission 2035 Multiplayer

## Local Development

### Prerequisites
- Node.js 24+ (see `.nvmrc`)
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Server runs on http://localhost:3000
```

## Docker Deployment

### Build & Run Locally
```bash
# Build image
docker build -t mission2035 .

# Run container
docker run -p 3000:3000 mission2035
```

### Using Docker Compose
```bash
# Start with automatic reload
docker-compose up

# Access: http://localhost:3000
```

## Cloud Deployment

### 🚄 Railway (Recommended - Free tier available)

1. **Create Railway account**: https://railway.app
2. **Connect GitHub**:
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Authorize and select `Mission2035` repo
3. **Auto-deploy**: Changes pushed to `main` auto-deploy
4. **Environment**:
   - PORT: `3000` (auto-set)
   - NODE_ENV: `production`

**Railway URL**: Your app gets a public URL automatically

### 🌩️ Heroku (Legacy - Paid plans)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create mission2035-yourname

# Set Node version
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### ⚡ Vercel

1. **Create Vercel account**: https://vercel.com
2. **Import from Git**:
   - Click "New Project"
   - Select `Mission2035` repository
   - Vercel detects `vercel.json`
3. **Deploy**: Click "Deploy"
4. **WebSocket Support**: Ensure serverless functions aren't used (use Node.js runtime)

**Note**: Vercel serverless has WebSocket limitations. Use Railway or Heroku for best compatibility.

### 🐳 DigitalOcean App Platform

1. Create DigitalOcean account
2. Click "Create" → "Apps"
3. Connect GitHub repository
4. Auto-detects `Dockerfile`
5. Set environment:
   - HTTP_PORT: `3000`
6. Deploy

### 🐙 GitHub Actions (CD/CI)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railwayapp/deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

Get `RAILWAY_TOKEN` from Railway dashboard.

## Environment Variables

Create `.env` file locally (not committed):

```bash
NODE_ENV=development
PORT=3000
```

Set in cloud provider dashboard:
- **Railway**: Project Settings → Variables
- **Heroku**: Settings → Config Vars
- **Vercel**: Settings → Environment Variables

## Scaling

### Database (Production)

For persistent data, add PostgreSQL:

**Railway**:
1. Click "New" in project
2. Select PostgreSQL
3. Connect to Node.js app

**Heroku**:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

### Redis (Session Management)

**Railway**: Add Redis add-on
**Heroku**: `heroku addons:create heroku-redis:premium-0`

### Load Balancing

For multiple instances:
- **Railway**: Auto load-balancing
- **Heroku**: Use Dyno formation
- **DigitalOcean**: Enable auto-scaling

## Monitoring

### Logs

**Railway**:
```bash
railway logs
```

**Heroku**:
```bash
heroku logs --tail
heroku logs --app=mission2035-yourname --num=100
```

### Health Check

Add endpoint in `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});
```

### Performance

- Monitor WebSocket connections
- Check memory usage
- Track player count metrics

## SSL/HTTPS

All cloud providers auto-provide HTTPS. For WebSocket:

**Recommended**: Use `wss://` (WebSocket Secure)

Update client code:
```javascript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(protocol + '//' + window.location.host);
```

## Rollback

**Railway**: Click previous deployment
**Heroku**: `heroku releases:rollback`
**Vercel**: Previous deployments in dashboard

## Troubleshooting

### WebSocket Connection Failed
- Check if firewall allows WebSocket
- Verify `ws://` or `wss://` protocol
- Check server logs

### Out of Memory
- Increase dyno size (Heroku)
- Check for memory leaks
- Monitor active connections

### Slow Performance
- Add Redis for caching
- Enable gzip compression
- Use CDN for static files

## Cost Estimates (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway | $5 credit | $5+ |
| Heroku  | None      | $7+  |
| Vercel  | Free*     | $10+ |
| DigitalOcean | None  | $5+  |

*Vercel free for static sites; requires upgrade for WebSocket

## Next Steps

1. ✅ Test locally: `npm run dev`
2. ✅ Push to GitHub
3. ✅ Choose provider (Railway recommended)
4. ✅ Connect GitHub
5. ✅ Deploy
6. ✅ Test public URL
7. ✅ Monitor logs
