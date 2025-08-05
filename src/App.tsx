import React from 'react';
import { SocialBatteryProvider } from './context/SocialBatteryContext';
import { SocialBatteryDashboard } from './components/SocialBattery/SocialBatteryDashboard';
import './App.css';

function App() {
  return (
    <SocialBatteryProvider>
      <div className="App">
        <SocialBatteryDashboard />
      </div>
    </SocialBatteryProvider>
  );
}

export default App;
