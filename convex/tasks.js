import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByMilestone = query({
  args: { milestoneId: v.id("milestones") },
  handler: async (ctx, { milestoneId }) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", milestoneId))
      .collect();
    tasks.sort((a, b) => a.order - b.order);
    return tasks;
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const listByContext = query({
  args: { context: v.string() },
  handler: async (ctx, { context }) => {
    const all = await ctx.db.query("tasks").collect();
    return all.filter((t) => !t.done && t.context === context);
  },
});

export const listScheduledForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_scheduled", (q) => q.eq("scheduledDate", date))
      .collect();
    const result = [];
    for (const t of tasks) {
      const project = await ctx.db.get(t.projectId);
      result.push({ ...t, projectName: project?.name, projectTier: project?.tier });
    }
    result.sort((a, b) => (a.scheduledStart || "").localeCompare(b.scheduledStart || ""));
    return result;
  },
});

export const create = mutation({
  args: {
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
    title: v.string(),
    order: v.number(),
    context: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    scheduledStart: v.optional(v.string()),
    scheduledDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", { ...args, done: false });
  },
});

export const toggle = mutation({
  args: { id: v.id("tasks"), timeSpent: v.optional(v.number()) },
  handler: async (ctx, { id, timeSpent }) => {
    const task = await ctx.db.get(id);
    if (!task) return;
    const newDone = !task.done;
    const patch = {
      done: newDone,
      doneAt: newDone ? Date.now() : undefined,
    };
    if (newDone && timeSpent !== undefined) patch.timeSpent = timeSpent;
    await ctx.db.patch(id, patch);
    if (newDone) {
      const siblings = await ctx.db
        .query("tasks")
        .withIndex("by_milestone", (q) => q.eq("milestoneId", task.milestoneId))
        .collect();
      if (siblings.every((t) => (t._id === id ? true : t.done))) {
        const milestone = await ctx.db.get(task.milestoneId);
        await ctx.db.patch(task.milestoneId, { done: true, doneAt: Date.now() });
        if (milestone?.phaseId) {
          const phaseMilestones = await ctx.db
            .query("milestones")
            .withIndex("by_phase", (q) => q.eq("phaseId", milestone.phaseId))
            .collect();
          if (phaseMilestones.every((m) => (m._id === task.milestoneId ? true : m.done))) {
            await ctx.db.patch(milestone.phaseId, { done: true });
          }
        }
      }
    } else {
      const milestone = await ctx.db.get(task.milestoneId);
      if (milestone?.done) {
        await ctx.db.patch(task.milestoneId, { done: false, doneAt: undefined });
        if (milestone.phaseId) {
          const phase = await ctx.db.get(milestone.phaseId);
          if (phase?.done) await ctx.db.patch(milestone.phaseId, { done: false });
        }
      }
    }
  },
});

export const updateTitle = mutation({
  args: { id: v.id("tasks"), title: v.string() },
  handler: async (ctx, { id, title }) => {
    await ctx.db.patch(id, { title });
  },
});

export const updateSchedule = mutation({
  args: {
    id: v.id("tasks"),
    scheduledDate: v.optional(v.string()),
    scheduledStart: v.optional(v.string()),
    scheduledDuration: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const clearSchedule = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      scheduledDate: undefined,
      scheduledStart: undefined,
      scheduledDuration: undefined,
    });
  },
});

export const updateContext = mutation({
  args: { id: v.id("tasks"), context: v.optional(v.string()) },
  handler: async (ctx, { id, context }) => {
    await ctx.db.patch(id, { context });
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
