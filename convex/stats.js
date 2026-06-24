import { query } from "./_generated/server";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function weekStartStr() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  return start.toISOString().split("T")[0];
}

export const getDailyPulse = query({
  handler: async (ctx) => {
    const today = todayStr();
    const tasks = await ctx.db.query("tasks").collect();
    const tasksDoneToday = tasks.filter(
      (t) => t.done && t.doneAt && new Date(t.doneAt).toISOString().split("T")[0] === today
    );

    const timeLogs = await ctx.db.query("timeLogs").collect();
    const todayLogs = timeLogs.filter((l) => l.date === today);
    const minutesLoggedToday = todayLogs.reduce((s, l) => s + l.minutes, 0);

    const projects = await ctx.db.query("projects").collect();
    const projectMap = {};
    for (const p of projects) projectMap[p._id] = p;

    const counts = {};
    for (const t of tasksDoneToday) {
      counts[t.projectId] = (counts[t.projectId] || 0) + 1;
    }
    const projectBreakdown = Object.entries(counts).map(([id, count]) => ({
      name: projectMap[id]?.name || "Unknown",
      count,
    }));

    const scheduledToday = tasks.filter((t) => t.scheduledDate === today && !t.done);

    const deenLog = await ctx.db
      .query("deenLogs")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
    const healthLog = await ctx.db
      .query("healthLogs")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    return {
      tasksDoneToday: tasksDoneToday.length,
      minutesLoggedToday,
      projectBreakdown,
      scheduledRemaining: scheduledToday.length,
      quranDone: deenLog?.quranRead || false,
      gymDone: healthLog?.gymSession || false,
    };
  },
});

export const getWeeklyPerformance = query({
  handler: async (ctx) => {
    const ws = weekStartStr();
    const wsTime = new Date(ws + "T00:00:00").getTime();
    const tasks = await ctx.db.query("tasks").collect();
    const completedThisWeek = tasks.filter(
      (t) => t.done && t.doneAt && t.doneAt >= wsTime
    );

    const projects = await ctx.db.query("projects").collect();
    const projectMap = {};
    for (const p of projects) projectMap[p._id] = p.name;

    const taskCounts = {};
    for (const task of completedThisWeek) {
      taskCounts[task.projectId] = (taskCounts[task.projectId] || 0) + 1;
    }

    const timeLogs = await ctx.db.query("timeLogs").collect();
    const weekLogs = timeLogs.filter((l) => l.date >= ws);
    const minCounts = {};
    for (const log of weekLogs) {
      minCounts[log.projectId] = (minCounts[log.projectId] || 0) + log.minutes;
    }

    const allIds = new Set([...Object.keys(taskCounts), ...Object.keys(minCounts)]);
    const byProject = [...allIds].map((id) => ({
      name: projectMap[id] || "Unknown",
      tasks: taskCounts[id] || 0,
      minutes: minCounts[id] || 0,
    }));
    byProject.sort((a, b) => b.tasks - a.tasks);

    const contextBreakdown = { deep_work: 0, quick: 0, errand: 0 };
    for (const t of completedThisWeek) {
      if (t.context && contextBreakdown[t.context] !== undefined) {
        contextBreakdown[t.context]++;
      }
    }

    return {
      totalCompleted: completedThisWeek.length,
      byProject,
      contextBreakdown,
    };
  },
});

export const getWeeklyHistory = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const completed = tasks.filter((t) => t.done && t.doneAt);
    const now = Date.now();
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekEnd = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const count = completed.filter(
        (t) => t.doneAt >= weekStart.getTime() && t.doneAt < weekEnd.getTime()
      ).length;
      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      weeks.push({ label, count });
    }
    return weeks;
  },
});

export const getDashboardAlerts = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.neq(q.field("tier"), "parked"))
      .collect();
    const today = todayStr();
    const missingNextAction = projects.filter((p) => !p.nextAction.trim());
    const overdue = projects.filter((p) => p.deadline && p.deadline < today);

    const lastReview = await ctx.db.query("weeklyReviews").collect();
    let daysSinceReview = null;
    if (lastReview.length > 0) {
      lastReview.sort((a, b) => b.completedAt - a.completedAt);
      daysSinceReview = Math.floor(
        (Date.now() - lastReview[0].completedAt) / (1000 * 60 * 60 * 24)
      );
    }

    return { missingNextAction, overdue, daysSinceReview };
  },
});
