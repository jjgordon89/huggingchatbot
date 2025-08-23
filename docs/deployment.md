# Deployment Guide

Complete guide for deploying the AI Platform to production environments.

## 📋 Overview

The AI Platform is a client-side React application that can be deployed to various hosting platforms. This guide covers deployment options, configuration, and best practices.

## 🚀 Quick Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Environment Variables**
   ```bash
   # Add in Vercel dashboard
   VITE_APP_NAME=AI Platform
   VITE_APP_ENV=production
   ```

4. **Custom Domain**
   - Add your domain in Vercel dashboard
   - Configure DNS records as shown

### Netlify

1. **Build Settings**
   ```bash
   # Build command
   npm run build
   
   # Publish directory
   dist
   ```

2. **Deploy**
   ```bash
   # Using Netlify CLI
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Redirects Configuration**
   ```toml
   # netlify.toml
   [build]
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

## 🏗️ Build Configuration

### Production Build

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Preview production build
npm run preview
```

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false, // Disable in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          workflow: ['reactflow'],
          utils: ['lodash-es', 'date-fns'],
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
```

### Asset Optimization

```bash
# Optimize images before deployment
npm install -g imagemin-cli
imagemin src/assets/* --out-dir=dist/assets

# Gzip compression (if not handled by CDN)
gzip -r dist/
```

## 🌐 Hosting Platforms

### Vercel

**Pros:**
- Zero configuration for Vite
- Automatic deployments from Git
- Edge network and caching
- Environment variable management

**Configuration:**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci"
}
```

### Netlify

**Pros:**
- Drag-and-drop deployment
- Form handling and serverless functions
- Branch deployments
- Custom headers and redirects

**Configuration:**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
```

### AWS S3 + CloudFront

**Pros:**
- Full AWS integration
- Cost-effective for high traffic
- Global CDN
- Custom configurations

**Deployment Script:**
```bash
#!/bin/bash
# Deploy to S3 with CloudFront invalidation

# Build the application
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Firebase Hosting

**Pros:**
- Google infrastructure
- Easy custom domain setup
- Preview channels
- Integration with Firebase services

**Configuration:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### GitHub Pages

**Pros:**
- Free for public repositories
- Automatic deployments
- Custom domain support

**GitHub Actions Workflow:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## ⚙️ Environment Configuration

### Environment Variables

```bash
# Production environment variables
VITE_APP_NAME="AI Platform"
VITE_APP_ENV="production"
VITE_APP_VERSION="1.0.0"

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
VITE_SENTRY_DSN="SENTRY_DSN"

# Feature flags
VITE_ENABLE_ANALYTICS="true"
VITE_ENABLE_SENTRY="true"
VITE_ENABLE_PWA="true"
```

### Runtime Configuration

```typescript
// src/config/index.ts
export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AI Platform',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV || 'development',
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    sentry: import.meta.env.VITE_ENABLE_SENTRY === 'true',
    pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
  },
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  },
  monitoring: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  },
};
```

## 🔒 Security Configuration

### Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: blob: *.openai.com;
  connect-src 'self' *.openai.com *.anthropic.com *.googleapis.com;
  frame-src 'none';
  object-src 'none';
">
```

### Headers Configuration

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

### HTTPS Enforcement

```javascript
// Redirect HTTP to HTTPS in production
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  window.location.replace(`https:${window.location.href.substring(window.location.protocol.length)}`);
}
```

## 📊 Performance Optimization

### Caching Strategy

```nginx
# nginx.conf
server {
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  
  location /index.html {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
}
```

### Compression

```apache
# .htaccess for Apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### Bundle Analysis

```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx vite build --mode analyze

# Monitor Core Web Vitals
npm install web-vitals
```

## 🔍 Monitoring and Analytics

### Error Monitoring

```typescript
// Sentry configuration
import * as Sentry from '@sentry/react';

if (config.features.sentry && config.monitoring.sentryDsn) {
  Sentry.init({
    dsn: config.monitoring.sentryDsn,
    environment: config.app.environment,
    release: config.app.version,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### Analytics Integration

```typescript
// Google Analytics 4
import { gtag } from 'ga-gtag';

if (config.features.analytics && config.analytics.googleAnalyticsId) {
  gtag('config', config.analytics.googleAnalyticsId, {
    page_title: document.title,
    page_location: window.location.href,
  });
}

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (config.features.analytics) {
    gtag('event', eventName, parameters);
  }
};
```

### Performance Monitoring

```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🚦 Health Checks

### Application Health

```typescript
// Health check endpoint simulation
export const healthCheck = async (): Promise<HealthStatus> => {
  const checks = await Promise.allSettled([
    checkLocalStorage(),
    checkIndexedDB(),
    checkServiceWorker(),
  ]);

  return {
    status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
    checks: checks.map((check, index) => ({
      name: ['localStorage', 'indexedDB', 'serviceWorker'][index],
      status: check.status,
      message: check.status === 'rejected' ? check.reason : 'OK',
    })),
    timestamp: new Date().toISOString(),
  };
};
```

### Uptime Monitoring

```yaml
# .github/workflows/uptime.yml
name: Uptime Check

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  uptime:
    runs-on: ubuntu-latest
    steps:
      - name: Check website
        run: |
          curl -f https://your-domain.com/health || exit 1
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run lint
        run: npm run lint
      - name: Type check
        run: npm run type-check

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
        env:
          VITE_APP_ENV: production
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🛡️ Backup and Recovery

### Data Backup

```typescript
// Backup user data
export const createBackup = () => {
  const backup = {
    workspaces: localStorage.getItem('workspaces'),
    chats: localStorage.getItem('chats'),
    workflows: localStorage.getItem('workflows'),
    settings: localStorage.getItem('settings'),
    timestamp: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-platform-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### Disaster Recovery

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/ai-platform"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf "$BACKUP_DIR/app-$DATE.tar.gz" dist/

# Backup configuration
cp .env.production "$BACKUP_DIR/env-$DATE.backup"

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

## 📝 Post-Deployment Checklist

### Functional Testing
- [ ] Application loads correctly
- [ ] All routes are accessible
- [ ] API integrations work
- [ ] File uploads function
- [ ] Chat interface responds
- [ ] Workflow builder operates
- [ ] Settings save properly

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] Bundle size optimized
- [ ] Images compressed
- [ ] CDN configured correctly

### Security Testing
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] No sensitive data exposed
- [ ] CSP policy implemented
- [ ] XSS protection enabled

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Analytics implemented
- [ ] Uptime monitoring active
- [ ] Performance metrics tracked
- [ ] Log aggregation setup

---

This deployment guide ensures your AI Platform is deployed securely, performantly, and with proper monitoring in place. Choose the hosting option that best fits your needs and follow the security best practices outlined above.