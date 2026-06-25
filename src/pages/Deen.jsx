import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import CalendarHeatmap from "../components/CalendarHeatmap";
import { todayString } from "../lib/utils";

export default function Deen() {
  const logs = useQuery(api.deen.listLogs, {});
  const streak = useQuery(api.deen.getStreak);
  const logDeen = useMutation(api.deen.log);

  if (logs === undefined || !streak) return <div className="text-muted p-8">Loading...</div>;

  const readDates = new Set(logs.filter((l) => l.quranRead).map((l) => l.date));
  const graceDates = new Set(logs.filter((l) => l.graceDayUsed).map((l) => l.date));
  const allActiveDates = new Set([...readDates, ...graceDates]);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-6">Deen</h1>

      <div className="mb-6">
        <CalendarHeatmap weeks={16} dateSet={allActiveDates} graceDates={graceDates} />
      </div>

      <div className="flex gap-8 font-mono text-sm flex-wrap mb-6">
        <div>
          <div className="text-muted text-xs mb-1">Current streak</div>
          <div className={`text-2xl ${streak.streakWarning ? "text-[#E8A838]" : "text-accent"}`}>
            {streak.currentStreak} <span className="text-sm text-muted">days</span>
            {streak.streakWarning && <span className="text-sm text-[#E8A838] ml-2">— miss tomorrow and it resets</span>}
          </div>
        </div>
        <div>
          <div className="text-muted text-xs mb-1">Longest streak</div>
          <div className="text-text text-2xl">{streak.longestStreak} <span className="text-sm text-muted">days</span></div>
        </div>
        <div>
          <div className="text-muted text-xs mb-1">This month</div>
          <div className="text-text text-2xl">{streak.thisMonth} <span className="text-sm text-muted">/ {streak.daysInMonth}</span></div>
        </div>
      </div>

      {streak.graceAvailable && (
        <button
          type="button"
          onClick={() => logDeen({ date: yesterdayStr, quranRead: false, graceDayUsed: true })}
          className="px-4 py-2 border border-accent text-accent text-sm font-medium hover:bg-accent/10"
        >
          Use grace day for yesterday
        </button>
      )}
    </div>
  );
}
