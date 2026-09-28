import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { WalletPage } from './pages/WalletPage';
import { WeatherPage } from './pages/WeatherPage';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/weather" element={<WeatherPage />} />
      </Routes>
    </Router>
  );
}

export default App;
