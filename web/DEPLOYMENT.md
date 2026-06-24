# GitHub Pages Deployment Guide for Daily Notes Web Version

## Quick Start

### 1. Repository Setup

First, you need to push this repository to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Add Daily Notes app"
git branch -M main
git remote add origin https://github.com/yourusername/DailyNotes.git
git push -u origin main
```

**Replace `yourusername` with your actual GitHub username.**

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select branch: **main** and folder: **web** (or **/root** if deploying from root)
5. Click **Save**

### 3. Your Site URL

After enabling GitHub Pages, your site will be available at:
- `https://yourusername.github.io/DailyNotes/`

Update the GitHub links in `web/index.html`:
- Replace `yourusername` in all GitHub URLs with your actual username

## Option A: Manual Deployment

1. Edit the HTML links if needed
2. Push to GitHub
3. GitHub Pages will automatically deploy the `web/` folder

## Option B: Using GitHub Actions (Automatic)

To automatically deploy every time you push:

1. Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy Web Version

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web
          cname: (leave empty if not using custom domain)
```

2. Push this file to your repository
3. GitHub Actions will automatically deploy on each push

## Local Testing

To test the web version locally:

```bash
# Using Python 3
python -m http.server 8000 --directory web

# Using Node.js (http-server)
npx http-server web

# Using live-server
npx live-server web
```

Then open `http://localhost:8000` in your browser.

## File Structure

```
DailyNotes/
├── web/
│   ├── index.html          # Main page with phone mockup
│   ├── styles.css          # All styling including phone frame
│   ├── app.js              # App logic and state management
│   └── DEPLOYMENT.md       # This file
├── src/                    # React Native source code
├── app/                    # Expo Router pages
└── package.json
```

## Features

✅ Phone mockup display (Android-style)  
✅ Full calendar with note counts  
✅ Note management (add, delete, favorite)  
✅ Search and filter  
✅ Color-coded notes  
✅ Local storage (persists data)  
✅ Responsive design  
✅ Dark mode ready  

## Customization

### Change Phone Mockup Style
Edit `web/styles.css`:
- `.phone-mockup` - adjust dimensions
- `.phone-status-bar` - customize status bar
- `.phone-home-button` - adjust home button style

### Update App Branding
Edit `web/index.html`:
- Change favicon in `<link rel="icon">`
- Update feature descriptions in `.features` section
- Modify GitHub links

### Adjust Colors
Edit `:root` variables in `web/styles.css`:
```css
:root {
    --primary: #1e40af;      /* Main theme color */
    --primary-light: #3b82f6;
    --primary-dark: #1e3a8a;
    /* ... more colors ... */
}
```

## Troubleshooting

**Site not showing?**
- Verify GitHub Pages is enabled in repository settings
- Check that you're using the correct URL format
- Wait a few minutes for GitHub to deploy

**Links are broken?**
- Update GitHub username in `web/index.html`
- Check `.github/workflows/deploy.yml` if using Actions

**Data not persisting?**
- Check browser console for localStorage errors
- Ensure JavaScript is enabled
- Try clearing browser cache

## Support

For issues or improvements, create a GitHub Issue in your repository.

---

**Happy note-taking! 📝**
