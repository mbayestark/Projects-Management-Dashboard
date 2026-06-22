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

export const create = mutation({
  args: {
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      done: false,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const task = await ctx.db.get(id);
    if (!task) return;
    const newDone = !task.done;
    await ctx.db.patch(id, {
      done: newDone,
      doneAt: newDone ? Date.now() : undefined,
    });
    if (newDone) {
      const siblingTasks = await ctx.db
        .query("tasks")
        .withIndex("by_milestone", (q) =>
          q.eq("milestoneId", task.milestoneId)
        )
        .collect();
      const allDone = siblingTasks.every((t) =>
        t._id === id ? true : t.done
      );
      if (allDone) {
        await ctx.db.patch(task.milestoneId, {
          done: true,
          doneAt: Date.now(),
        });
      }
    } else {
      const milestone = await ctx.db.get(task.milestoneId);
      if (milestone?.done) {
        await ctx.db.patch(task.milestoneId, {
          done: false,
          doneAt: undefined,
        });
      }
    }
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
