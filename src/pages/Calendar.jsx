import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { todayString } from "../lib/utils";

const TIER_COLORS = { critical: "#E84038", high: "#E8A838", responsibility: "#7B61FF" };

function dayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getWeekDays(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const dayOfWeek = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day.toISOString().split("T")[0];
  });
}

function DayView({ date }) {
  const tasks = useQuery(api.tasks.listScheduledForDate, { date });
  const startTimer = useMutation(api.timer.start);

  const allTasks = useQuery(api.tasks.listScheduledForDate, { date });
  const unscheduledToday = (allTasks || []).filter((t) => !t.scheduledStart && !t.done);
  const scheduled = (tasks || []).filter((t) => t.scheduledStart);

  const hours = [];
  for (let h = 7; h <= 21; h++) {
    const timeStr = `${String(h).padStart(2, "0")}:00`;
    const task = scheduled.find((t) => t.scheduledStart === timeStr);
    hours.push({ time: timeStr, task });
  }

  return (
    <div>
      <div className="mb-4">
        {hours.map(({ time, task }) => (
          <div key={time} className="flex items-stretch border-b border-border min-h-[36px]">
            <span className="font-mono text-xs text-muted w-16 py-2 shrink-0">{time}</span>
            {task ? (
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2"
                style={{ backgroundColor: (TIER_COLORS[task.projectTier] || "#6B6B6B") + "15" }}
              >
                <span className="text-sm text-text flex-1">{task.title}</span>
                <span className="text-xs text-muted">{task.projectName}</span>
                {!task.done && (
                  <button
                    type="button"
                    onClick={() => startTimer({ taskId: task._id, projectId: task.projectId })}
                    className="text-xs text-accent"
                  >
                    ▶
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 py-2" />
            )}
          </div>
        ))}
      </div>

      {unscheduledToday.length > 0 && (
        <div>
          <div className="text-[11px] text-muted uppercase tracking-widest mb-2">Unscheduled today</div>
          {unscheduledToday.map((t) => (
            <div key={t._id} className="flex items-center gap-2 py-1.5 text-sm">
              <span className="text-muted">·</span>
              <span className="text-text flex-1">{t.title}</span>
              <span className="text-xs text-muted">{t.projectName}</span>
              {t.context && <span className="text-[10px] text-muted">{t.context}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeekView({ date }) {
  const days = getWeekDays(date);
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid grid-cols-7 gap-1">
      {dayNames.map((d, i) => (
        <div key={d} className="text-center">
          <div className="text-[10px] text-muted uppercase mb-1">{d}</div>
          <div className={`text-xs font-mono mb-2 ${days[i] === todayString() ? "text-accent" : "text-muted"}`}>
            {days[i].slice(8)}
          </div>
          <DayColumn date={days[i]} />
        </div>
      ))}
    </div>
  );
}

function DayColumn({ date }) {
  const tasks = useQuery(api.tasks.listScheduledForDate, { date });
  if (!tasks) return <div className="h-20" />;
  return (
    <div className="flex flex-col gap-1">
      {tasks.filter((t) => !t.done).map((t) => (
        <div
          key={t._id}
          className="text-[10px] px-1 py-0.5 truncate text-left"
          style={{ backgroundColor: (TIER_COLORS[t.projectTier] || "#6B6B6B") + "20", color: TIER_COLORS[t.projectTier] || "#6B6B6B" }}
          title={t.title}
        >
          {t.scheduledStart?.slice(0, 5)} {t.title}
        </div>
      ))}
    </div>
  );
}

export default function Calendar() {
  const [date, setDate] = useState(todayString());
  const [view, setView] = useState("day");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setDate(shiftDate(date, view === "week" ? -7 : -1))} className="text-muted hover:text-text text-lg">◀</button>
          <h1 className="text-lg font-semibold text-text">{dayLabel(date)}</h1>
          <button type="button" onClick={() => setDate(shiftDate(date, view === "week" ? 7 : 1))} className="text-muted hover:text-text text-lg">▶</button>
        </div>
        <button
          type="button"
          onClick={() => setView(view === "day" ? "week" : "day")}
          className="text-xs text-muted border border-border px-3 py-1 hover:text-text"
        >
          {view === "day" ? "Week view" : "Day view"}
        </button>
      </div>
      {view === "day" ? <DayView date={date} /> : <WeekView date={date} />}
    </div>
  );
}
