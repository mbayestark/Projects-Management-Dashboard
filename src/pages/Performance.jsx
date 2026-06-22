import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Performance() {
  const weekly = useQuery(api.stats.getWeeklyPerformance);
  const history = useQuery(api.stats.getWeeklyHistory);
  const deenLogs = useQuery(api.deen.listLogs, {});
  const healthLogs = useQuery(api.health.listLogs, { limit: 30 });

  if (!weekly || !history) return <div className="text-muted p-8">Loading...</div>;

  const projectEntries = Object.entries(weekly.byProject).sort((a, b) => b[1] - a[1]);
  const maxTasks = projectEntries.length > 0 ? Math.max(...projectEntries.map((e) => e[1])) : 1;

  const quranDates = new Set((deenLogs || []).filter((l) => l.quranRead).map((l) => l.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let quranStreak = 0;
  const d = new Date(today);
  while (quranDates.has(d.toISOString().split("T")[0])) {
    quranStreak++;
    d.setDate(d.getDate() - 1);
  }

  const gymLogs = (healthLogs || []).filter((l) => l.gymSession);
  const gymByWeek = [];
  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    const count = gymLogs.filter((l) => {
      const ld = new Date(l.date + "T00:00:00");
      return ld >= weekStart && ld < weekEnd;
    }).length;
    gymByWeek.push(count);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-6">Performance</h1>

      <div className="mb-8 text-center">
        <div className="text-[11px] text-muted uppercase tracking-widest mb-2">This week</div>
        <div className="font-mono text-5xl text-accent">{weekly.totalCompleted}</div>
        <div className="text-sm text-muted mt-1">tasks completed</div>
      </div>

      {projectEntries.length > 0 && (
        <div className="mb-8">
          <div className="text-[11px] text-muted uppercase tracking-widest mb-3">By project</div>
          {projectEntries.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3 mb-2">
              <span className="text-sm text-text w-40 truncate">{name}</span>
              <div className="flex-1 bg-border h-3">
                <div
                  className="bg-accent h-3"
                  style={{ width: `${(count / maxTasks) * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs text-muted w-16 text-right">{count} tasks</span>
            </div>
          ))}
        </div>
      )}

      <div className="mb-8">
        <div className="text-[11px] text-muted uppercase tracking-widest mb-3">Velocity — Last 8 Weeks</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis dataKey="label" tick={{ fill: "#6B6B6B", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#6B6B6B", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #1F1F1F", color: "#F0EDE6" }} />
              <Bar dataKey="count" fill="#E8A838" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="text-[11px] text-muted uppercase tracking-widest mb-3">Streaks</div>
        <div className="flex gap-8 font-mono text-sm flex-wrap">
          <div>
            <div className="text-muted text-xs mb-1">Quran streak</div>
            <div className="text-accent text-xl">{quranStreak} days</div>
          </div>
          <div>
            <div className="text-muted text-xs mb-1">Gym (last 4 weeks)</div>
            <div className="text-text text-xl">{gymByWeek.join(" · ")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
