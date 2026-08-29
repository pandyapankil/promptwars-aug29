import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ParticipantHome from './pages/ParticipantHome';
import FindMyTeam from './pages/FindMyTeam';
import LiveOpsDashboard from './pages/LiveOpsDashboard';
import AnnouncementCenter from './pages/AnnouncementCenter';
import CheckinScanner from './pages/CheckinScanner';
import JudgeQueue from './pages/JudgeQueue';
import SubmissionUpload from './pages/SubmissionUpload';
import LeaderboardView from './pages/LeaderboardView';
import JudgeAssignment from './pages/JudgeAssignment';
import AppNav from './AppNav';

export default function App() {
  return (
    <BrowserRouter>
      <AppNav />
      <main role="main" className="w-full min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/participant" element={<ParticipantHome />} />
          <Route path="/find-team" element={<FindMyTeam />} />
          <Route path="/live-ops" element={<LiveOpsDashboard />} />
          <Route path="/announcements" element={<AnnouncementCenter />} />
          <Route path="/checkin" element={<CheckinScanner />} />
          <Route path="/judge" element={<JudgeQueue />} />
          <Route path="/submit" element={<SubmissionUpload />} />
          <Route path="/leaderboard" element={<LeaderboardView />} />
          <Route path="/assignments" element={<JudgeAssignment />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
