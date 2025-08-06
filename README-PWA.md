# Creative Energy Flow PWA 🌟

A Progressive Web Application for tracking and visualizing your creative energy patterns throughout the day. Built with React 19, TypeScript, and Chart.js for beautiful, accessible data visualization.

![Energy Flow Dashboard](https://img.shields.io/badge/Status-PWA_Ready-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Accessibility](https://img.shields.io/badge/A11y-WCAG_Compliant-green)

## ✨ Features

- **📊 Interactive Energy Tracking**: Real-time energy level monitoring with intuitive UI
- **📈 Visual Analytics**: Multiple chart types for comprehensive energy analysis
  - Energy flow timeline charts
  - Energy type distribution (Physical, Mental, Creative, Social)
  - Social battery visualization  
  - Weekly heatmap patterns
- **🧠 AI-Powered Insights**: Smart analysis of your energy patterns
- **📱 Progressive Web App**: 
  - Installable on desktop and mobile
  - Offline functionality with service worker
  - Background sync when connection returns
- **♿ Accessibility First**: WCAG compliant with proper ARIA labels
- **🎨 Responsive Design**: Beautiful UI that works on all devices

## 🚀 Quick Start

### Development Mode
```bash
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view in the browser.

### Production Build & PWA Testing
```bash
npm run build
npm install -g serve
serve -s build -l 3001
```
Open [http://localhost:3001](http://localhost:3001) to test PWA features including:
- App installation prompts
- Offline functionality
- Service worker caching
- Background sync

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Visit the app in your browser
2. Look for the install icon in the address bar
3. Click "Install Creative Energy Flow"
4. Use as a standalone app!

### Mobile (iOS/Android)
1. Open in Safari (iOS) or Chrome (Android)
2. Tap the share button
3. Select "Add to Home Screen"
4. Launch from your home screen

## 🛠 Project Structure

```
src/
├── components/
│   ├── EnergyDashboard.tsx          # Main dashboard component
│   ├── PWAInstallButton.tsx         # PWA installation UI
│   └── charts/
│       ├── EnergyFlowChart.tsx      # Timeline visualization
│       ├── EnergyTypeChart.tsx      # Distribution charts
│       ├── SocialBatteryChart.tsx   # Social energy meter
│       └── WeeklyEnergyHeatmap.tsx  # Pattern heatmap
├── data/
│   └── energyDataService.ts         # Data management & AI insights
├── services/
│   └── PWAService.ts               # Service worker management
├── types/
│   └── energy.ts                   # TypeScript definitions
└── utils/
    └── colors.ts                   # Theme and color utilities
```

## 🎯 Available Scripts

### `npm start`
Runs the app in development mode with hot reloading.

### `npm test`
Launches the test runner for component and service testing.

### `npm run build`
Creates an optimized production build with PWA features enabled.

### `npm run eject`
⚠️ **One-way operation!** Ejects from Create React App for full configuration control.

## 🔧 Technical Details

- **Framework**: React 19 with TypeScript for type safety
- **Charts**: Chart.js with react-chartjs-2 for interactive visualizations  
- **PWA**: Service worker with offline caching and background sync
- **Accessibility**: ARIA compliant with semantic HTML structure
- **Styling**: CSS modules with responsive design patterns
- **Data**: LocalStorage persistence with offline-first approach

## 📚 Learn More

- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [React Documentation](https://reactjs.org/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

*Built with ❤️ for creative professionals who want to optimize their energy patterns*
