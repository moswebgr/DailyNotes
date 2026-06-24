# Daily Notes

A beautiful cross-platform note-taking app built with **React Native**, **Expo**, and **TypeScript**.

This project includes both the mobile app and a dedicated **web version** displayed in a polished phone mockup, ready to publish on GitHub Pages.

## 🚀 Live Demo

The GitHub Pages site is available after deployment at:

`https://moswebgr.github.io/DailyNotes/`

## 📦 Project Structure

```
DailyNotes/
├── app/                      # Expo Router screens for the mobile app
├── src/                      # React Native source code
├── web/                      # Static web version with phone mockup
├── .github/workflows/        # GitHub Actions deployment workflow
├── README.md                 # Project overview and usage guide
├── setup-github-pages.bat    # Windows helper to setup GitHub Pages links
├── setup-github-pages.sh     # macOS/Linux helper
├── start-web-server.bat      # Windows local web server tester
└── start-web-server.sh       # macOS/Linux local web server tester
```

## ✨ Features

- 📅 Calendar-based note organization
- 🎨 Color-coded notes
- ⭐ Favorites support
- 🔍 Search and filter notes
- ⚙️ App settings with theme, sorting, and default options
- 💾 Local persistence for notes and settings
- 🌐 Dedicated web app with phone mockup
- 📱 Cross-platform support for iOS, Android, and Web

## 🧩 Web Version

The `web/` folder contains a standalone static web version of the app, including:

- `web/index.html` — phone mockup shell and web page structure
- `web/styles.css` — responsive styling and phone frame design
- `web/app.js` — app logic, notes state, and UI behavior
- `web/DEPLOYMENT.md` — deployment instructions for GitHub Pages

The repository also contains a root `index.html` redirect to `web/` so the site loads the web app automatically when published.

## 💻 Local Development

### Mobile App

Install dependencies and start Expo:

```bash
npm install
npx expo start
```

Then choose one of the available targets:
- `a` — Android
- `i` — iOS
- `w` — Web

### Web Preview

Use the provided local web server helper scripts:

#### Windows
```powershell
start-web-server.bat
```

#### macOS / Linux
```bash
bash start-web-server.sh
```

Open `http://localhost:8000` after the server starts.

## 📌 GitHub Pages Deployment

This project is already configured for deployment using GitHub Pages.

### Automatic deployment

The workflow `.github/workflows/deploy-web.yml` publishes the `web/` folder automatically when you push to `main`.

### Manual enablement

1. Go to your repository Settings.
2. Open Pages.
3. Set the source branch to `main`.
4. Set the folder to `/web`.
5. Save.

## � Export APK

To build a production Android APK, use Expo Application Services (EAS):

1. Install EAS CLI globally:

```bash
npm install -g eas-cli
```

2. Log in with your Expo account:

```bash
eas login
```

3. Build the APK:

```bash
eas build --platform android --profile production
```

4. Download the resulting APK from the link shown by EAS after the build completes.

If you prefer a legacy Expo APK build, you can also run:

```bash
expo build:android -t apk
```

## �🛠️ Useful Commands

```bash
npm install
npm start
npm run web
npm run android
npm run ios
npm run lint
```

## 🔧 Notes

- Data is stored locally in browser/local device storage.
- This repo does not include cloud sync or backend storage.
- The web version is static and works offline via local storage.

## 📄 License

MIT License
