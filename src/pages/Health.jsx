import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { todayString, getWeekDates } from "../lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

const TARGET_WEIGHT = 85;
const TARGET_DATE = "2026-08-31";

function WeightSection({ logs }) {
  const logHealth = useMutation(api.health.log);
  const [weight, setWeight] = useState("");
  const today = todayString();

  const chartData = logs
    .filter((l) => l.weight)
    .map((l) => ({ date: l.date.slice(5), weight: l.weight }));

  const current = chartData.length > 0 ? chartData[chartData.length - 1].weight : null;
  const first = chartData.length > 0 ? chartData[0].weight : null;
  const lost = current && first ? (first - current).toFixed(1) : "0.0";

  let rateStr = "—";
  let projectedStr = "—";
  let neededStr = "—";
  if (chartData.length >= 2) {
    const firstDate = new Date(logs.find((l) => l.weight).date + "T00:00:00");
    const lastDate = new Date(logs.filter((l) => l.weight).slice(-1)[0].date + "T00:00:00");
    const weeks = (lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000);
    if (weeks > 0) {
      const rate = (first - current) / weeks;
      rateStr = `${rate.toFixed(1)} kg/wk`;
      if (rate > 0) {
        const remaining = current - TARGET_WEIGHT;
        const weeksNeeded = remaining / rate;
        const arrival = new Date(lastDate.getTime() + weeksNeeded * 7 * 24 * 60 * 60 * 1000);
        projectedStr = `target by ${arrival.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
      }
    }
    const targetDate = new Date(TARGET_DATE + "T00:00:00");
    const weeksLeft = (targetDate - new Date()) / (7 * 24 * 60 * 60 * 1000);
    if (weeksLeft > 0 && current) {
      neededStr = `need −${((current - TARGET_WEIGHT) / weeksLeft).toFixed(1)} kg/wk`;
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-medium text-muted uppercase tracking-widest mb-4">Weight Tracker</h2>
      {chartData.length >= 1 && (
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis dataKey="date" tick={{ fill: "#6B6B6B", fontSize: 11 }} />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: "#6B6B6B", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #1F1F1F", color: "#F0EDE6" }} />
              <ReferenceLine y={TARGET_WEIGHT} stroke="#6B6B6B" strokeDasharray="5 5" label={{ value: "Target", fill: "#6B6B6B", fontSize: 11 }} />
              <Line type="monotone" dataKey="weight" stroke="#E8A838" dot={chartData.length < 10} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="font-mono text-sm text-muted mb-1 flex gap-4 flex-wrap">
        <span>Current <span className="text-text">{current ?? "—"} kg</span></span>
        <span>Lost <span className="text-text">{lost} kg</span></span>
        <span>Rate <span className="text-text">{rateStr}</span></span>
      </div>
      <div className="font-mono text-sm text-muted mb-4 flex gap-4 flex-wrap">
        <span>{projectedStr !== "—" ? `At this rate: ${projectedStr}` : ""}</span>
        <span>{neededStr !== "—" ? `To hit Aug 31: ${neededStr}` : ""}</span>
      </div>
      <div className="flex gap-2 items-center">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)" className="bg-card border border-border px-3 py-2 text-sm text-text outline-none w-32" />
        <button type="button" onClick={() => {
          if (weight) { logHealth({ date: today, weight: parseFloat(weight) }); setWeight(""); }
        }} className="px-4 py-2 bg-accent text-bg text-sm font-medium">Log</button>
      </div>
    </div>
  );
}

function GymSection({ logs }) {
  const dates = getWeekDates(10);
  const gymDates = new Set(logs.filter((l) => l.gymSession).map((l) => l.date));
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  let thisWeekSessions = 0;
  for (const d of dates) {
    const date = new Date(d + "T00:00:00");
    if (date >= startOfWeek && date < endOfWeek && gymDates.has(d)) thisWeekSessions++;
  }

  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-medium text-muted uppercase tracking-widest mb-4">Gym Consistency</h2>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {Array.from({ length: 10 }, (_, week) => (
          <div key={week} className="flex flex-col gap-1.5">
            {Array.from({ length: 7 }, (_, day) => {
              const idx = week * 7 + day;
              const date = dates[idx];
              if (!date) return <div key={day} className="w-4 h-4" />;
              const isFuture = date > todayString();
              return (
                <div key={day} className={`w-4 h-4 rounded-sm ${isFuture ? "bg-transparent" : gymDates.has(date) ? "bg-accent" : "bg-border"}`} title={date} />
              );
            })}
          </div>
        ))}
      </div>
      <div className="font-mono text-sm text-muted">This week: <span className="text-text">{thisWeekSessions} sessions</span></div>
    </div>
  );
}

function HRSection({ logs }) {
  const logHealth = useMutation(api.health.log);
  const [hr, setHr] = useState("");
  const today = todayString();
  const chartData = logs.filter((l) => l.restingHR).map((l) => ({ date: l.date.slice(5), hr: l.restingHR }));
  const current = chartData.length > 0 ? chartData[chartData.length - 1].hr : null;
  const first = chartData.length > 0 ? chartData[0].hr : null;
  const delta = current && first ? current - first : null;

  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-medium text-muted uppercase tracking-widest mb-4">Resting HR</h2>
      {chartData.length >= 1 && (
        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis dataKey="date" tick={{ fill: "#6B6B6B", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6B6B6B", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #1F1F1F", color: "#F0EDE6" }} />
              <Line type="monotone" dataKey="hr" stroke="#E8A838" dot={chartData.length < 10} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="font-mono text-sm text-muted mb-4">
        Current: <span className="text-text">{current ?? "—"} bpm</span>
        {delta !== null && (
          <span className="ml-4">Delta: <span className={delta < 0 ? "text-green-500" : "text-danger"}>{delta > 0 ? "+" : ""}{delta} bpm</span></span>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <input type="number" value={hr} onChange={(e) => setHr(e.target.value)}
          placeholder="HR (bpm)" className="bg-card border border-border px-3 py-2 text-sm text-text outline-none w-32" />
        <button type="button" onClick={() => {
          if (hr) { logHealth({ date: today, restingHR: parseInt(hr) }); setHr(""); }
        }} className="px-4 py-2 bg-accent text-bg text-sm font-medium">Log</button>
      </div>
    </div>
  );
}

function AthleticSection() {
  const tests = useQuery(api.health.listAthleticTests);
  const logTest = useMutation(api.health.logAthleticTest);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: todayString(), spiderDrill: "", run2400m: "", lateralShuffle: "", verticalJump: "", plankHold: "" });
  if (!tests) return null;

  const fields = [
    { key: "spiderDrill", label: "Spider (s)", higherIsBetter: false },
    { key: "run2400m", label: "2.4km (s)", higherIsBetter: false },
    { key: "lateralShuffle", label: "Lateral (s)", higherIsBetter: false },
    { key: "verticalJump", label: "Vert (cm)", higherIsBetter: true },
    { key: "plankHold", label: "Plank (s)", higherIsBetter: true },
  ];

  function getDelta(idx, key) {
    if (idx === 0 || !tests[idx][key] || !tests[idx - 1][key]) return null;
    return tests[idx][key] - tests[idx - 1][key];
  }

  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-medium text-muted uppercase tracking-widest mb-4">Athletic Tests</h2>
      {tests.length > 0 && (
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs">
                <th className="text-left py-1 pr-4">Date</th>
                {fields.map((f) => <th key={f.key} className="text-left py-1 pr-4">{f.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {tests.map((test, i) => (
                <tr key={test._id} className="border-t border-border">
                  <td className="py-2 pr-4 font-mono text-xs">{test.date}</td>
                  {fields.map((f) => {
                    const val = test[f.key];
                    const d = getDelta(i, f.key);
                    const isGood = d !== null && (f.higherIsBetter ? d > 0 : d < 0);
                    const isBad = d !== null && (f.higherIsBetter ? d < 0 : d > 0);
                    return (
                      <td key={f.key} className="py-2 pr-4 font-mono text-xs">
                        {val ?? "—"}
                        {d !== null && (
                          <span className={`ml-1 ${isGood ? "text-green-500" : isBad ? "text-danger" : "text-muted"}`}>
                            {d > 0 ? "↑" : "↓"}{Math.abs(d).toFixed(1)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm ? (
        <div className="border border-border p-3 flex flex-col gap-2">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="bg-card border border-border px-2 py-1 text-sm text-text outline-none" />
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f) => (
              <input key={f.key} type="number" placeholder={f.label} value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="bg-card border border-border px-2 py-1 text-sm text-text outline-none" />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => {
              const data = { date: form.date };
              for (const f of fields) { if (form[f.key]) data[f.key] = parseFloat(form[f.key]); }
              logTest(data);
              setShowForm(false);
              setForm({ date: todayString(), spiderDrill: "", run2400m: "", lateralShuffle: "", verticalJump: "", plankHold: "" });
            }} className="px-4 py-2 bg-accent text-bg text-sm font-medium">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-muted">Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowForm(true)} className="text-sm text-muted hover:text-accent">+ Log test</button>
      )}
    </div>
  );
}

export default function Health() {
  const logs = useQuery(api.health.listLogs, { limit: 60 });
  if (logs === undefined) return <div className="text-muted p-8">Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-6">Health</h1>
      <WeightSection logs={logs} />
      <GymSection logs={logs} />
      <HRSection logs={logs} />
      <AthleticSection />
    </div>
  );
}
