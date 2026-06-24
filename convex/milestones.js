import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    milestones.sort((a, b) => a.order - b.order);
    for (const m of milestones) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_milestone", (q) => q.eq("milestoneId", m._id))
        .collect();
      tasks.sort((a, b) => a.order - b.order);
      m.tasks = tasks;
    }
    return milestones;
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    order: v.number(),
    phaseId: v.optional(v.id("phases")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("milestones", { ...args, done: false });
  },
});

export const toggle = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, { id }) => {
    const milestone = await ctx.db.get(id);
    if (!milestone) return;
    const newDone = !milestone.done;
    await ctx.db.patch(id, {
      done: newDone,
      doneAt: newDone ? Date.now() : undefined,
    });
    if (newDone && milestone.phaseId) {
      const siblings = await ctx.db
        .query("milestones")
        .withIndex("by_phase", (q) => q.eq("phaseId", milestone.phaseId))
        .collect();
      if (siblings.every((m) => (m._id === id ? true : m.done))) {
        await ctx.db.patch(milestone.phaseId, { done: true });
      }
    }
  },
});

export const deleteMilestone = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, { id }) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", id))
      .collect();
    for (const t of tasks) await ctx.db.delete(t._id);
    await ctx.db.delete(id);
  },
});
