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
    const result = [];
    for (const milestone of milestones) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_milestone", (q) => q.eq("milestoneId", milestone._id))
        .collect();
      tasks.sort((a, b) => a.order - b.order);
      result.push({ ...milestone, tasks });
    }
    return result;
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("milestones", {
      ...args,
      done: false,
    });
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
  },
});

export const deleteMilestone = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, { id }) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", id))
      .collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }
    await ctx.db.delete(id);
  },
});
