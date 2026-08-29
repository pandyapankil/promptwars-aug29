// Status chip color maps — exact STATUS STATE MAP labels only
export const STATUS_COLORS: Record<string, string> = {
  // Check-in
  REGISTERED: 'bg-slate-700 text-slate-300 border border-slate-600',
  CHECKED_IN: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  NO_SHOW: 'bg-red-500/20 text-red-400 border border-red-500/40',
  LATE_ARRIVAL: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  // Team
  SOLO: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  TEAM_FORMING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  TEAM_CONFIRMED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  UNTEAMED: 'bg-red-500/20 text-red-400 border border-red-500/40',
  // Submission
  DRAFT: 'bg-slate-600/60 text-slate-300 border border-slate-500',
  SUBMITTED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  UNDER_REVIEW: 'bg-violet-500/20 text-violet-400 border border-violet-500/40',
  SCORED: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
  LATE_SUBMISSION: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  // Judging
  EVALUATION_COMPLETE: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  JUDGE_OVERDUE: 'bg-red-500/20 text-red-400 border border-red-500/40',
  AWAITING_JUDGE: 'bg-slate-600/60 text-slate-300 border border-slate-500',
  SCORING_AT_RISK: 'bg-red-600/30 text-red-300 border border-red-500/60',
  // Broadcast
  LIVE: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  SUPERSEDED: 'bg-slate-600/50 text-slate-400 border border-slate-500',
  CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/40',
  // Event
  ROUND_ACTIVE: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
  SCORING_IN_PROGRESS: 'bg-violet-500/20 text-violet-400 border border-violet-500/40',
  LEADERBOARD_LIVE: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
};

export function StatusChip({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-slate-700 text-slate-300 border border-slate-600';
  const isCritical = status === 'CRITICAL' || status === 'SCORING_AT_RISK';
  const isLive = status === 'LIVE' || status === 'ROUND_ACTIVE';

  return (
    <span className={`status-chip ${cls} ${isCritical ? 'animate-pulse' : ''}`}>
      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-current inline-block animate-pulse" />}
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

export function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
