import React from 'react';
import WeatherApp from '../../weather-react/src/App.jsx';
import '../../weather-react/src/styles.css';

export const WeatherPage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#181818] flex items-center justify-center">
      {/* Render Weather React Application */}
      <WeatherApp />
    </div>
  );
};

export default WeatherPage;
