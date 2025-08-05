# Creative Energy Flow

Progressive Web App for tracking creative energy and social battery with AI-powered personalized constraints.

## Features

- **Energy Tracking**: Monitor your creative energy levels throughout the day with intuitive tracking tools
- **Social Battery**: Keep track of your social interactions and recharge time needs
- **AI Insights**: Get personalized recommendations based on your energy patterns
- **Community**: Connect with others on similar productivity and wellness journeys

## Technologies

- **Next.js 15.4+** with TypeScript
- **Progressive Web App (PWA)** capabilities with offline support
- **Tailwind CSS** with custom Warm Creative color palette
- **React Icons** for consistent iconography
- **Date-fns** for date handling
- **Recharts** for data visualizations

## Color Palette (Warm Creative)

- **Primary**: Warm orange (#FF6B35)
- **Secondary**: Deep coral (#E55D75)
- **Accent**: Golden yellow (#F7B731)
- **Background**: Soft cream (#FFF8E7)
- **Text**: Charcoal (#2C3E50)

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/M-LN/creative-energy-flow.git
cd creative-energy-flow
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## PWA Features

The application includes:

- **Service Worker**: Automatically generated with caching strategies
- **Web App Manifest**: Configured for installation on mobile devices
- **Offline Support**: Core functionality available without internet connection
- **Push Notifications**: Ready for future implementation
- **App-like Experience**: Fullscreen mode on mobile devices

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles with Tailwind CSS
│   ├── layout.tsx         # Root layout with PWA configuration
│   └── page.tsx           # Landing page
├── components/
│   ├── layout/            # Layout components
│   │   ├── DashboardLayout.tsx
│   │   └── Header.tsx
│   └── ui/                # UI components
│       └── Card.tsx
public/
├── icons/                 # PWA icons (placeholder)
├── manifest.json          # PWA manifest
└── sw.js                  # Service worker (auto-generated)
```

## Development Roadmap

- [ ] User authentication system
- [ ] Energy tracking forms and data persistence
- [ ] Social battery monitoring tools
- [ ] AI-powered insights and recommendations
- [ ] Data visualization with charts
- [ ] User profiles and preferences
- [ ] Community features
- [ ] Push notifications
- [ ] Advanced PWA features (background sync, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
