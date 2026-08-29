import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ParticipantHome from './pages/ParticipantHome';
import FindMyTeam from './pages/FindMyTeam';
import LiveOpsDashboard from './pages/LiveOpsDashboard';
import AnnouncementCenter from './pages/AnnouncementCenter';
import CheckinScanner from './pages/CheckinScanner';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/participant" element={<ParticipantHome />} />
        <Route path="/find-team" element={<FindMyTeam />} />
        <Route path="/live-ops" element={<LiveOpsDashboard />} />
        <Route path="/announcements" element={<AnnouncementCenter />} />
        <Route path="/checkin" element={<CheckinScanner />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
