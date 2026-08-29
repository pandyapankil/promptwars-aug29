import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusChip, formatCountdown } from '../lib/ui';

export default function SubmissionUpload() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Mock deadline 1h from now
  const SUBMISSION_DEADLINE = new Date(Date.now() + 60 * 60 * 1000);
  const [countdown, setCountdown] = useState('01:00:00');
  const isClosed = false; // In a real app, this would check against Date.now()

  useEffect(() => {
    function tick() {
      setCountdown(formatCountdown(SUBMISSION_DEADLINE.getTime() - Date.now()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 pb-10">
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span className="text-emerald-400 font-bold text-sm">EP</span>
          <span className="text-sm text-slate-500">/ Participant</span>
        </button>
        <div className="flex items-center gap-2">
          <StatusChip status="TEAM_CONFIRMED" />
          <span className="text-sm text-slate-400">Team Orion</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Project Submission</h1>
          <div className="text-right">
            <div className="text-xs text-slate-400">Deadline</div>
            <div className="text-lg font-mono font-bold text-white">{countdown}</div>
          </div>
        </div>

        {/* LATE_SUBMISSION example seeded state */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white font-medium mb-1">Volt Vikings — submitted 00:07:12 after close</p>
            <p className="text-xs text-amber-400">Accepted at organizer discretion</p>
          </div>
          <StatusChip status="LATE_SUBMISSION" />
        </div>

        <div className="card-gradient p-6 space-y-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-300">Draft Submission</span>
            <StatusChip status="DRAFT" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project Title</label>
            <input 
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. PulseBoard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              rows={4}
              placeholder="Describe your solution..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project File (Cloud Storage)</label>
            <input 
              type="file"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
            />
          </div>

          <button 
            disabled={isClosed || !title || !description || !file}
            className="w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-all"
          >
            {isClosed ? 'Submission Closed' : 'Submit Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
