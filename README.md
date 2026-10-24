# Expense Tracker Pro (v4.0)
> Smart Multi-Persona Finance, Live UPI Notification Auto-Sync, and Social P2P Khaata Tracker in Indian Rupees (₹).

---

## 🌟 Key Features
1. **Multi-Persona Budgeting**:
   - 🎓 **Student Mode**: Daily allowance cap, canteen ledger, and 1-tap roommate bill splitter.
   - 📈 **Trader Mode**: Stock/F&O/Crypto trade journal, win-rate metrics, and Trade P&L calculator.
   - 💼 **Small Business Mode**: Client receivables/invoicing ledger and 18% GST calculator.
   - 👔 **Salaried Professional Mode**: 50/30/20 Harvard budgeting rule meter and SIP tracking.

2. **⚡ Real-Time Bank & UPI Notification Auto-Sync**:
   - Mandatory permission setup for seamless background transaction tracking.
   - Intelligent regex parser for SMS and push notifications from **HDFC, SBI, ICICI, Axis, Google Pay, PhonePe, Paytm, and CRED**.
   - Auto-credits and debits your ledger with zero manual data entry.
   - Animated native OS notification dropdown banner with Web Audio chime.
   - Built-in live notification simulator with 1-tap bank presets and custom text input.

3. **🛡️ Pre-Payment Categorizer & Impulse Shield**:
   - Categorize expenses *before* money is debited.
   - Guardrails against impulsive spending exceeding your daily spend allowance.
   - Instant 50/50 expense splitting with friends directly at the time of payment.

4. **🤝 Peer-to-Peer (P2P) Khaata & Live UPI QR Codes**:
   - Track **"Money I Owe"** vs. **"Money Owed to Me"**.
   - Generates live scannable UPI QR codes and 1-click WhatsApp request links.
   - **Smart Debt Return Alerts**: Intelligently alerts you when your current balance is sufficient to settle pending debts.

5. **📱 Progressive Web App (PWA)**:
   - Installable on Android, iOS, Windows, and Mac.
   - 100% offline functionality powered by Service Worker (`sw.js`).
   - Private client-side database (`localStorage`).

---

## 📂 Project Structure
- `index.html` — Main UI, dashboards, modals, and templates.
- `app.js` — Core application logic, regex notification engine, and state management.
- `styles.css` — Custom glassmorphic fintech design system.
- `server.js` — Lightweight Node.js static server.
- `manifest.json` — PWA configuration.
- `sw.js` — Service worker for offline caching.
- `package.json` — Project metadata and run scripts.

---

## 💻 How to Run Locally

### Option 1: Node.js (Recommended)
```bash
node server.js
```
Open **`http://localhost:3000`** in your browser.

### Option 2: Direct Browser
You can also directly open `index.html` in any modern web browser.

---

## 📱 Android Compatibility & Native Features

Expense Tracker is built to deliver a 100% native Android application experience:

### 1. Progressive Web App (PWA) & Home Screen Installation
- **Open in Chrome on Android**: Navigate to your app URL.
- **Install App**: Tap the **"📱 Install App"** button in the header or tap Chrome's menu (`⋮`) -> **"Install app"** / **"Add to Home Screen"**.
- Runs in standalone immersive full-screen with native Android status bar styling (`#0a0f1d`) and notch safe-area padding (`env(safe-area-inset-top)`).

### 2. Android App Shortcuts (Launcher Quick Actions)
Long-press the Expense Tracker app icon on your Android home screen to instantly access:
- ⚡ **Scan & Pay (UPI)** (`/?shortcut=scan-pay`)
- ➕ **Record Transaction** (`/?shortcut=add-tx`)
- 🤝 **P2P Khaata & UPI QR** (`/?shortcut=p2p`)

### 3. Android System Back-Button & Edge Gesture Support
- Tapping the physical back button or swiping from either edge dismisses open modals (QR code, transaction dialogs, payment categorizer) instead of exiting the app.

### 4. Direct Android UPI App Launcher (`upi://pay`)
- When generating a P2P request or debt collection QR, tap **"⚡ Open in UPI App"** to fire Android's native intent chooser and open **Google Pay, PhonePe, Paytm, BHIM, or CRED** directly.

### 5. Native Android Web Share Sheet
- Tap **"Share Request Link"** to trigger Android's native share modal (`navigator.share`) directly sharing to WhatsApp, Telegram, or SMS.

---

## 🛠️ Building an Android APK (.apk)

### Method A: 1-Click Capacitor Build (Configured via `capacitor.config.json`)
```bash
# 1. Install Capacitor CLI
npx -y @capacitor/cli@latest init

# 2. Add Android platform
npx -y @capacitor/core@latest
npx -y @capacitor/android@latest
npx cap add android

# 3. Open in Android Studio & Build APK
npx cap open android
```
Select **Build > Build Bundle(s) / APK(s) > Build APK(s)** in Android Studio.

### Method B: PWABuilder (No Android Studio Needed)
1. Deploy your app to Netlify, Vercel, or GitHub Pages.
2. Visit **[PWABuilder.com](https://www.pwabuilder.com)**.
3. Enter your deployed URL and click **Package for Android (Google Play / APK)**.

---

## 🚀 How to Deploy (Free)

1. **Netlify Drop (Drag & Drop)**:
   - Drag this entire project folder to [app.netlify.com/drop](https://app.netlify.com/drop).
2. **Vercel**:
   - Run `npx -y vercel` in the project directory.
3. **Render / Railway**:
   - Connect your GitHub repo and set run command to `node server.js`.

