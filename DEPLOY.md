# Deployment Guide

## QuizTastic Opposites - Render.com Deployment

### Prerequisites
- A GitHub account
- A Render.com account (free tier available)

### Option 1: Using Render Blueprint (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [https://render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Review the configuration and click "Apply"

3. **Access Your App**
   - Your app will be available at: `https://quiztastic-opposites.onrender.com`
   - Or configure a custom domain in Render settings

### Option 2: Manual Static Site Setup

1. **Create New Static Site**
   - Go to Render.com Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Name**: quiztastic-opposites
   - **Branch**: main (or your branch name)
   - **Build Command**:
     ```bash
     bash setup.sh && cd apps/quiztastic-opposites && npm install && npm run build
     ```
   - **Publish Directory**: `apps/quiztastic-opposites/dist`

3. **Environment Variables** (Optional)
   - `NODE_VERSION`: 22

4. **Deploy**
   - Click "Create Static Site"
   - Wait for the build to complete (usually 2-5 minutes)

### Render Free Tier Limitations

- 100 GB bandwidth per month
- Automatic SSL certificates
- Custom domains supported
- Auto-deploy on git push
- Apps may sleep after inactivity (cold start on next visit)

### Troubleshooting

**Build fails with "command not found: bash"**
- Ensure the build command starts with `bash setup.sh`

**404 errors on page refresh**
- The render.yaml includes rewrite rules to handle SPA routing
- If using manual setup, add a `_redirects` file with: `/* /index.html 200`

**App not loading images**
- Check browser console for errors
- Pollinations AI requires internet access
- Images are generated on-demand and cached

### Local Testing Before Deploy

```bash
# Test the full build process
bash setup.sh
cd apps/quiztastic-opposites
npm install
npm run build
npm run preview  # Preview the production build locally
```

### Continuous Deployment

Once set up, Render will automatically:
- Detect new commits to your repository
- Rebuild and redeploy your app
- Show build logs in the dashboard

### Custom Domain (Optional)

1. Go to your Static Site settings
2. Click "Custom Domain"
3. Add your domain and configure DNS settings
4. SSL certificate is automatically provisioned

## Success Checklist

- [ ] Repository pushed to GitHub
- [ ] Render Blueprint applied or Static Site created
- [ ] Build completed successfully
- [ ] App accessible via Render URL
- [ ] All game modes working correctly
- [ ] Dark mode toggle functional
- [ ] Images loading properly

## Support

For Render-specific issues, consult:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)

For app-specific issues, check the main README.md
