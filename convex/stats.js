import { query } from "./_generated/server";

export const getWeeklyPerformance = query({
  handler: async (ctx) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    const weekStart = startOfWeek.getTime();

    const tasks = await ctx.db.query("tasks").collect();
    const completedThisWeek = tasks.filter(
      (t) => t.done && t.doneAt && t.doneAt >= weekStart
    );

    const projects = await ctx.db.query("projects").collect();
    const projectMap = {};
    for (const p of projects) {
      projectMap[p._id] = p.name;
    }

    const byProject = {};
    for (const task of completedThisWeek) {
      const name = projectMap[task.projectId] || "Unknown";
      byProject[name] = (byProject[name] || 0) + 1;
    }

    return {
      totalCompleted: completedThisWeek.length,
      byProject,
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
    const today = new Date().toISOString().split("T")[0];
    const missingNextAction = projects.filter((p) => !p.nextAction.trim());
    const overdue = projects.filter(
      (p) => p.deadline && p.deadline < today
    );
    return { missingNextAction, overdue };
  },
});
