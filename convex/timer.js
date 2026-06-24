import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getActive = query({
  handler: async (ctx) => {
    const row = await ctx.db.query("activeTimer").first();
    if (!row) return null;
    const task = await ctx.db.get(row.taskId);
    const project = await ctx.db.get(row.projectId);
    return { ...row, taskTitle: task?.title, projectName: project?.name, projectTier: project?.tier };
  },
});

export const start = mutation({
  args: { taskId: v.id("tasks"), projectId: v.id("projects") },
  handler: async (ctx, { taskId, projectId }) => {
    const existing = await ctx.db.query("activeTimer").first();
    if (existing) {
      let accumulated = existing.accumulatedMs;
      if (existing.running) {
        accumulated += Date.now() - existing.startedAt;
      }
      const totalMin = Math.round(accumulated / 60000);
      if (totalMin > 0) {
        const today = new Date().toISOString().split("T")[0];
        await ctx.db.insert("timeLogs", {
          projectId: existing.projectId,
          taskId: existing.taskId,
          date: today,
          minutes: totalMin,
        });
      }
      await ctx.db.delete(existing._id);
    }
    return await ctx.db.insert("activeTimer", {
      taskId,
      projectId,
      startedAt: Date.now(),
      accumulatedMs: 0,
      running: true,
    });
  },
});

export const pause = mutation({
  handler: async (ctx) => {
    const row = await ctx.db.query("activeTimer").first();
    if (!row || !row.running) return;
    const elapsed = Date.now() - row.startedAt;
    await ctx.db.patch(row._id, {
      running: false,
      pausedAt: Date.now(),
      accumulatedMs: row.accumulatedMs + elapsed,
    });
  },
});

export const resume = mutation({
  handler: async (ctx) => {
    const row = await ctx.db.query("activeTimer").first();
    if (!row || row.running) return;
    await ctx.db.patch(row._id, {
      running: true,
      startedAt: Date.now(),
      pausedAt: undefined,
    });
  },
});

export const end = mutation({
  handler: async (ctx) => {
    const row = await ctx.db.query("activeTimer").first();
    if (!row) return 0;
    let accumulated = row.accumulatedMs;
    if (row.running) {
      accumulated += Date.now() - row.startedAt;
    }
    const totalMin = Math.round(accumulated / 60000);
    if (totalMin > 0) {
      const today = new Date().toISOString().split("T")[0];
      await ctx.db.insert("timeLogs", {
        projectId: row.projectId,
        taskId: row.taskId,
        date: today,
        minutes: totalMin,
      });
    }
    await ctx.db.delete(row._id);
    return totalMin;
  },
});
