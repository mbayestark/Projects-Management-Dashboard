import { getWeekDates } from "../lib/utils";

export default function CalendarHeatmap({ weeks, dateSet }) {
  const dates = getWeekDates(weeks);
  const rows = 7;
  const cols = weeks;
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="flex gap-1">
      <div className="flex flex-col gap-1 mr-1">
        {dayLabels.map((d, i) => (
          <div key={i} className="text-[10px] text-muted h-4 flex items-center">
            {i % 2 === 0 ? d : ""}
          </div>
        ))}
      </div>
      {Array.from({ length: cols }, (_, col) => (
        <div key={col} className="flex flex-col gap-1">
          {Array.from({ length: rows }, (_, row) => {
            const idx = col * 7 + row;
            const date = dates[idx];
            if (!date) return <div key={row} className="w-4 h-4" />;
            const active = dateSet.has(date);
            const today = new Date().toISOString().split("T")[0];
            const isFuture = date > today;
            return (
              <div
                key={row}
                className={`w-4 h-4 ${
                  isFuture
                    ? "bg-transparent"
                    : active
                      ? "bg-accent"
                      : "bg-border"
                }`}
                title={date}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
