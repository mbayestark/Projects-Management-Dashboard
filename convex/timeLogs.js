import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const weekSummary = query({
  handler: async (ctx) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    const weekStartStr = startOfWeek.toISOString().split("T")[0];

    const logs = await ctx.db.query("timeLogs").collect();
    const thisWeek = logs.filter((l) => l.date >= weekStartStr);
    const byProject = {};
    let total = 0;
    for (const log of thisWeek) {
      byProject[log.projectId] = (byProject[log.projectId] || 0) + log.minutes;
      total += log.minutes;
    }
    return { total, byProject };
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const logs = await ctx.db
      .query("timeLogs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    logs.sort((a, b) => b.date.localeCompare(a.date));
    return logs;
  },
});

export const log = mutation({
  args: {
    projectId: v.id("projects"),
    minutes: v.number(),
    date: v.string(),
    taskId: v.optional(v.id("tasks")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("timeLogs", args);
  },
});
