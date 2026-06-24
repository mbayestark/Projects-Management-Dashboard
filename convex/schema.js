import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    category: v.string(),
    tier: v.string(),
    nextAction: v.string(),
    deadline: v.optional(v.string()),
    createdAt: v.number(),
    originIdeaId: v.optional(v.id("ideas")),
  }),

  phases: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    order: v.number(),
    done: v.boolean(),
  }).index("by_project", ["projectId"]),

  milestones: defineTable({
    projectId: v.id("projects"),
    phaseId: v.optional(v.id("phases")),
    title: v.string(),
    done: v.boolean(),
    doneAt: v.optional(v.number()),
    order: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_phase", ["phaseId"]),

  tasks: defineTable({
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
    title: v.string(),
    done: v.boolean(),
    doneAt: v.optional(v.number()),
    order: v.number(),
    context: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    scheduledStart: v.optional(v.string()),
    scheduledDuration: v.optional(v.number()),
    timeSpent: v.optional(v.number()),
  })
    .index("by_milestone", ["milestoneId"])
    .index("by_project", ["projectId"])
    .index("by_scheduled", ["scheduledDate"]),

  timeLogs: defineTable({
    projectId: v.id("projects"),
    taskId: v.optional(v.id("tasks")),
    date: v.string(),
    minutes: v.number(),
    note: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_date", ["date"]),

  noteLogs: defineTable({
    projectId: v.id("projects"),
    date: v.string(),
    content: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_date", ["projectId", "date"]),

  healthLogs: defineTable({
    date: v.string(),
    weight: v.optional(v.number()),
    restingHR: v.optional(v.number()),
    gymSession: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  }).index("by_date", ["date"]),

  athleticTests: defineTable({
    date: v.string(),
    spiderDrill: v.optional(v.number()),
    run2400m: v.optional(v.number()),
    lateralShuffle: v.optional(v.number()),
    verticalJump: v.optional(v.number()),
    plankHold: v.optional(v.number()),
  }).index("by_date", ["date"]),

  deenLogs: defineTable({
    date: v.string(),
    quranRead: v.boolean(),
    graceDayUsed: v.optional(v.boolean()),
  }).index("by_date", ["date"]),

  ideas: defineTable({
    title: v.string(),
    body: v.optional(v.string()),
    category: v.string(),
    status: v.string(),
    promotedToProjectId: v.optional(v.id("projects")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  weeklyReviews: defineTable({
    weekStart: v.string(),
    completedAt: v.number(),
    intentionsByProject: v.array(
      v.object({
        projectId: v.id("projects"),
        intention: v.string(),
        nextActionUpdated: v.boolean(),
      })
    ),
    tiersReordered: v.optional(v.boolean()),
    generalNote: v.optional(v.string()),
  }).index("by_week", ["weekStart"]),

  userSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  activeTimer: defineTable({
    taskId: v.id("tasks"),
    projectId: v.id("projects"),
    startedAt: v.number(),
    pausedAt: v.optional(v.number()),
    accumulatedMs: v.number(),
    running: v.boolean(),
  }),
});
