import { Link } from 'react-router-dom';

export default function AppNav() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 p-2 rounded-2xl shadow-xl flex gap-1">
        {[
          { label: 'Home', to: '/', icon: '🏠' },
          { label: 'Judge', to: '/judge', icon: '⚖️' },
          { label: 'Leaderboard', to: '/leaderboard', icon: '🏆' },
          { label: 'Submit', to: '/submit', icon: '📤' },
          { label: 'Organizer', to: '/live-ops', icon: '🎛️' },
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors text-[10px] font-medium"
          >
            <span className="text-lg mb-0.5">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
