import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const ideas = await ctx.db.query("ideas").collect();
    ideas.sort((a, b) => b.createdAt - a.createdAt);
    return ideas;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    body: v.optional(v.string()),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("ideas", {
      ...args,
      status: "raw",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("ideas"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const patch = { updatedAt: Date.now() };
    if (fields.title !== undefined) patch.title = fields.title;
    if (fields.body !== undefined) patch.body = fields.body;
    if (fields.category !== undefined) patch.category = fields.category;
    if (fields.status !== undefined) patch.status = fields.status;
    await ctx.db.patch(id, patch);
  },
});

export const promoteToProject = mutation({
  args: {
    id: v.id("ideas"),
    projectName: v.string(),
    tier: v.string(),
  },
  handler: async (ctx, { id, projectName, tier }) => {
    const idea = await ctx.db.get(id);
    if (!idea) return;
    const projectId = await ctx.db.insert("projects", {
      name: projectName,
      category: idea.category,
      tier,
      nextAction: "",
      createdAt: Date.now(),
    });
    await ctx.db.patch(id, {
      status: "promoted",
      promotedToProjectId: projectId,
      updatedAt: Date.now(),
    });
    return projectId;
  },
});
