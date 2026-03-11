import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChampionshipProvider } from './context/ChampionshipContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Matches from './pages/Matches';
import MatchControl from './pages/MatchControl';
import Settings from './pages/Settings';
import TeamsDashboard from './pages/TeamsDashboard';

function App() {
  return (
    <Router>
      <ChampionshipProvider>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/match/:id" element={<MatchControl />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/teams-dashboard" element={<TeamsDashboard />} />
              {/* Optional: Add catch-all or default route here */}
            </Routes>
          </main>
        </div>
      </ChampionshipProvider>
    </Router>
  );
}

export default App;
