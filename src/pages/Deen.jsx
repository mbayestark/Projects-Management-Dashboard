import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import CalendarHeatmap from "../components/CalendarHeatmap";

export default function Deen() {
  const logs = useQuery(api.deen.listLogs, {});

  if (logs === undefined) return <div className="text-muted p-8">Loading...</div>;

  const readDates = new Set(logs.filter((l) => l.quranRead).map((l) => l.date));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let d = new Date(today);
  while (true) {
    const dateStr = d.toISOString().split("T")[0];
    if (readDates.has(dateStr)) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  const sorted = [...readDates].sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sorted[i - 1] + "T00:00:00");
      const curr = new Date(sorted[i] + "T00:00:00");
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  const month = today.getMonth();
  const year = today.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let thisMonth = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    if (readDates.has(dateStr)) thisMonth++;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-6">Deen</h1>
      <div className="mb-6">
        <CalendarHeatmap weeks={16} dateSet={readDates} />
      </div>
      <div className="flex gap-8 font-mono text-sm flex-wrap">
        <div>
          <div className="text-muted text-xs mb-1">Current streak</div>
          <div className="text-accent text-2xl">{currentStreak} <span className="text-sm text-muted">days</span></div>
        </div>
        <div>
          <div className="text-muted text-xs mb-1">Longest streak</div>
          <div className="text-text text-2xl">{longestStreak} <span className="text-sm text-muted">days</span></div>
        </div>
        <div>
          <div className="text-muted text-xs mb-1">This month</div>
          <div className="text-text text-2xl">{thisMonth} <span className="text-sm text-muted">/ {daysInMonth}</span></div>
        </div>
      </div>
    </div>
  );
}
