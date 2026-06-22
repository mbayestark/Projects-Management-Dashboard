export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getWeekDates(weeksBack) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - today.getDay() - (weeksBack - 1) * 7 + 1);
  for (let i = 0; i < weeksBack * 7; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}
