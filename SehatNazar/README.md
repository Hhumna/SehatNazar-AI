# SehatNazar 🦠📊

SehatNazar is an offline-first, early-warning mobile application designed for Lady Health Workers (LHWs) in rural Pakistan. Built with React Native and Expo, it allows health workers to rapidly log syndromic health data, which is then analyzed on-device to detect potential disease outbreaks (like Dengue) before they spread.

## Key Features

- 🎙️ **Voice & Tap Logging**: LHWs can quickly log cases using a simulated voice transcription interface or a rapid tap-based UI.
- 📉 **Real-time Outbreak Engine**: The app evaluates local case densities using a specialized algorithm (`lib/engine.js`). It triggers Alert/Watch states dynamically based on the frequency and cohesion of reported symptoms within a Union Council (UC).
- 📶 **Offline-First Architecture**: Built for low-connectivity environments. Cases are saved securely on the device and will sync automatically when network connectivity is restored.
- 🇵🇰 **Full Urdu Localization**: A complete dual-language interface (English and Urdu) tailored for the target demographic, using customized Noto Naskh Arabic typography for high readability.
- 🔐 **Secure Local Authentication**: PIN-based authentication system storing profile data securely in local storage, abstracted for easy transition to a cloud backend (e.g., Supabase) in the future.

## Tech Stack

- **Framework**: React Native (Expo Router)
- **Styling**: Luminous Soft-Modern Design System (Pastel gradients, Glassmorphism, ambient shadows in `constants/theme.js`)
- **Storage**: AsyncStorage
- **Cryptography**: Expo Crypto
- **Icons**: Expo Vector Icons (Ionicons)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Emulator or a physical device with Expo Go.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/SehatNazar.git
   cd SehatNazar
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start -c
   ```
4. Press `a` to open the app on a connected Android device or emulator.

## Project Structure

```
├── app/
│   ├── (auth)/        # Authentication flows (Sign in, Sign up, Reset)
│   ├── (tabs)/        # Main app tabs (Home, Log, Nearby, Records)
│   └── _layout.js     # Root layout & providers
├── components/        # Reusable UI components (Cards, Pills, ProgressRings)
├── constants/         # Theme, colors, typography
├── data/              # Base options (symptoms, demographics)
├── lib/               # Core logic (auth, storage, engine, i18n, AI assessments)
└── assets/            # Fonts, images, splash screens
```

## How It Works (The Engine)

The core logic of SehatNazar lives in `lib/engine.js`. It calculates a dynamic Risk Score for each Union Council based on:
1. **Case Count vs Baseline**: How many cases are reported compared to the historical norm.
2. **Symptom Cohesion**: How similar the reported cases are (e.g., if everyone has High Fever + Skin Rash, cohesion is high).
3. **Lift**: How rapid the influx of cases is.

If a cluster's score exceeds `3.0`, it triggers an **ALERT**. If it exceeds `1.5`, it triggers a **WATCH**.

---
*Developed for empowering frontline health workers.*
