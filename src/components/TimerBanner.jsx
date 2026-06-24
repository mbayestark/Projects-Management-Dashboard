import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const TIER_COLORS = { critical: "#E84038", high: "#E8A838", responsibility: "#7B61FF" };

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimerBanner({ timer }) {
  const pauseTimer = useMutation(api.timer.pause);
  const resumeTimer = useMutation(api.timer.resume);
  const endTimer = useMutation(api.timer.end);
  const toggleTask = useMutation(api.tasks.toggle);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer.running]);

  const elapsed = timer.running
    ? timer.accumulatedMs + (now - timer.startedAt)
    : timer.accumulatedMs;

  const color = TIER_COLORS[timer.projectTier] || "#E8A838";

  async function handleEnd() {
    const minutes = await endTimer();
    if (minutes > 0) {
      await toggleTask({ id: timer.taskId, timeSpent: minutes });
    }
  }

  return (
    <div
      className="sticky top-0 z-30 px-4 py-3 flex items-center gap-4 flex-wrap"
      style={{ backgroundColor: color + "15", borderBottom: `1px solid ${color}40` }}
    >
      <span className="text-sm" style={{ color }}>⏱</span>
      <span className="text-sm text-text flex-1 truncate">{timer.taskTitle}</span>
      <span className="font-mono text-lg text-text">{formatTime(elapsed)}</span>
      {timer.running ? (
        <button type="button" onClick={() => pauseTimer()} className="text-xs px-3 py-1 border border-border text-muted hover:text-text">
          Pause
        </button>
      ) : (
        <button type="button" onClick={() => resumeTimer()} className="text-xs px-3 py-1 border text-text" style={{ borderColor: color }}>
          Resume
        </button>
      )}
      <button type="button" onClick={handleEnd} className="text-xs px-3 py-1 text-bg font-medium" style={{ backgroundColor: color }}>
        End
      </button>
    </div>
  );
}
