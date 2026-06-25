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
    let consecutiveMisses = 0;
    const d = new Date(today);
    while (true) {
      const dateStr = d.toISOString().split("T")[0];
      const entry = logMap[dateStr];
      if (entry?.quranRead || entry?.graceDayUsed) {
        currentStreak++;
        consecutiveMisses = 0;
        d.setDate(d.getDate() - 1);
      } else {
        consecutiveMisses++;
        if (consecutiveMisses >= 2) break;
        d.setDate(d.getDate() - 1);
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    let tempMisses = 0;
    const firstDate = Object.keys(logMap).sort()[0];
    if (firstDate) {
      const start = new Date(firstDate + "T00:00:00");
      const end = new Date(today);
      const cursor = new Date(start);
      while (cursor <= end) {
        const dateStr = cursor.toISOString().split("T")[0];
        const entry = logMap[dateStr];
        if (entry?.quranRead || entry?.graceDayUsed) {
          tempStreak++;
          tempMisses = 0;
        } else {
          tempMisses++;
          if (tempMisses >= 2) {
            tempStreak = 0;
            tempMisses = 0;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        cursor.setDate(cursor.getDate() + 1);
      }
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

    const todayStr = today.toISOString().split("T")[0];
    const todayEntry = logMap[todayStr];
    const todayDone = todayEntry?.quranRead || todayEntry?.graceDayUsed;
    const streakWarning = !todayDone && consecutiveMisses === 1;

    return {
      currentStreak,
      longestStreak,
      thisMonth,
      daysInMonth,
      graceAvailable: yesterdayMissed && !graceUsedRecently,
      streakWarning,
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
