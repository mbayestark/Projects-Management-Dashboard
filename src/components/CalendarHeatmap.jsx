import { getWeekDates } from "../lib/utils";

export default function CalendarHeatmap({ weeks, dateSet, graceDates }) {
  const dates = getWeekDates(weeks);
  const rows = 7;
  const cols = weeks;
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const graceSet = graceDates || new Set();

  return (
    <div className="flex gap-1.5">
      <div className="flex flex-col gap-1.5 mr-1">
        {dayLabels.map((d, i) => (
          <div key={i} className="text-[10px] text-muted w-4 h-4 flex items-center justify-center">
            {i % 2 === 0 ? d : ""}
          </div>
        ))}
      </div>
      {Array.from({ length: cols }, (_, col) => (
        <div key={col} className="flex flex-col gap-1.5">
          {Array.from({ length: rows }, (_, row) => {
            const idx = col * 7 + row;
            const date = dates[idx];
            if (!date) return <div key={row} className="w-4 h-4" />;
            const active = dateSet.has(date);
            const isGrace = graceSet.has(date);
            const today = new Date().toISOString().split("T")[0];
            const isFuture = date > today;
            return (
              <div
                key={row}
                className={`w-4 h-4 rounded-sm relative ${
                  isFuture
                    ? "bg-transparent"
                    : active
                      ? "bg-accent"
                      : "bg-border"
                }`}
                title={date}
              >
                {isGrace && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-bg" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
