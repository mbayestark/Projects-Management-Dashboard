import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const logs = await ctx.db.query("deenLogs").collect();
    logs.sort((a, b) => a.date.localeCompare(b.date));
    if (limit) return logs.slice(-limit);
    return logs;
  },
});

export const getStreak = query({
  handler: async (ctx) => {
    const logs = await ctx.db.query("deenLogs").collect();
    const logMap = {};
    for (const l of logs) logMap[l.date] = l;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    const d = new Date(today);
    while (true) {
      const dateStr = d.toISOString().split("T")[0];
      const entry = logMap[dateStr];
      if (entry?.quranRead || entry?.graceDayUsed) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    const sorted = Object.keys(logMap).sort();
    for (const date of sorted) {
      const entry = logMap[date];
      if (entry.quranRead || entry.graceDayUsed) {
        tempStreak++;
      } else {
        tempStreak = 0;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    const month = today.getMonth();
    const year = today.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let thisMonth = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const entry = logMap[dateStr];
      if (entry?.quranRead || entry?.graceDayUsed) thisMonth++;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayEntry = logMap[yesterdayStr];
    const yesterdayMissed = !yesterdayEntry?.quranRead && !yesterdayEntry?.graceDayUsed;

    let graceUsedRecently = false;
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const entry = logMap[checkDate.toISOString().split("T")[0]];
      if (entry?.graceDayUsed) { graceUsedRecently = true; break; }
    }

    return {
      currentStreak,
      longestStreak,
      thisMonth,
      daysInMonth,
      graceAvailable: yesterdayMissed && !graceUsedRecently,
    };
  },
});

export const log = mutation({
  args: {
    date: v.string(),
    quranRead: v.boolean(),
    graceDayUsed: v.optional(v.boolean()),
  },
  handler: async (ctx, { date, quranRead, graceDayUsed }) => {
    const existing = await ctx.db
      .query("deenLogs")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { quranRead, graceDayUsed });
      return existing._id;
    }
    return await ctx.db.insert("deenLogs", { date, quranRead, graceDayUsed });
  },
});
