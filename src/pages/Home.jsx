import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { getGreeting, todayString, daysUntil } from "../lib/utils";
import SegmentedProgress from "../components/SegmentedProgress";
import InlineEdit from "../components/InlineEdit";

const TIER_ORDER = ["critical", "high", "responsibility"];
const TIER_LABELS = { critical: "CRITICAL", high: "HIGH LEVERAGE", responsibility: "RESPONSIBILITY" };
const TIER_COLORS = { critical: "#E84038", high: "#E8A838", responsibility: "#7B61FF" };

function DailyPulse() {
  const pulse = useQuery(api.stats.getDailyPulse);
  if (!pulse) return null;
  const hour = new Date().getHours();
  const urgent = pulse.tasksDoneToday === 0 && hour >= 14;
  const h = Math.floor(pulse.minutesLoggedToday / 60);
  const m = pulse.minutesLoggedToday % 60;
  const timeStr = h > 0 ? `${h}h ${m}min` : `${m}min`;

  return (
    <Link to="/performance" className="no-underline">
      <div className={`border p-3 mb-6 ${urgent ? "border-accent/50 bg-accent/5" : "border-border"}`}>
        <div className="font-mono text-sm text-muted mb-2">
          Today — <span className="text-text">{pulse.tasksDoneToday} tasks done</span> · <span className="text-text">{timeStr} logged</span>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          {pulse.projectBreakdown.map(({ name, count }) => (
            <span key={name} className="text-xs text-muted">{name} <span className="font-mono text-text">{count}</span></span>
          ))}
        </div>
        <div className="flex gap-3 mt-2 text-xs">
          <span className={pulse.quranDone ? "text-accent" : "text-muted"}>Quran {pulse.quranDone ? "✓" : "✗"}</span>
          <span className={pulse.gymDone ? "text-accent" : "text-muted"}>Gym {pulse.gymDone ? "✓" : "✗"}</span>
        </div>
      </div>
    </Link>
  );
}

function TodayStrip() {
  const today = todayString();
  const deenLogs = useQuery(api.deen.listLogs, { limit: 2 });
  const healthLogs = useQuery(api.health.listLogs, { limit: 2 });
  const logDeen = useMutation(api.deen.log);
  const logHealth = useMutation(api.health.log);

  const todayDeen = deenLogs?.find((l) => l.date === today);
  const todayHealth = healthLogs?.find((l) => l.date === today);
  const quranDone = todayDeen?.quranRead || false;
  const gymDone = todayHealth?.gymSession || false;

  return (
    <div className="flex gap-3 mb-6">
      <button
        type="button"
        onClick={() => logDeen({ date: today, quranRead: !quranDone })}
        className={`px-4 py-2 text-sm font-medium border transition-colors ${
          quranDone ? "bg-accent text-bg border-accent" : "bg-transparent text-muted border-border hover:border-accent"
        }`}
      >
        Quran {quranDone ? "✓" : ""}
      </button>
      <button
        type="button"
        onClick={() => logHealth({ date: today, gymSession: !gymDone })}
        className={`px-4 py-2 text-sm font-medium border transition-colors ${
          gymDone ? "bg-accent text-bg border-accent" : "bg-transparent text-muted border-border hover:border-accent"
        }`}
      >
        Gym {gymDone ? "✓" : ""}
      </button>
    </div>
  );
}

function TodayBlocks() {
  const today = todayString();
  const scheduled = useQuery(api.tasks.listScheduledForDate, { date: today });
  const startTimer = useMutation(api.timer.start);
  if (!scheduled || scheduled.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="text-[11px] text-muted uppercase tracking-widest mb-3">Today's Blocks</div>
      {scheduled.map((task) => {
        const color = TIER_COLORS[task.projectTier] || "#6B6B6B";
        return (
          <div key={task._id} className="flex items-center gap-3 py-2 border-b border-border">
            <span className="font-mono text-xs text-muted w-16">{task.scheduledStart || "—"}</span>
            <span className="text-sm text-text flex-1">{task.title}</span>
            <span className="text-xs text-muted">{task.projectName}{task.scheduledDuration ? ` · ${task.scheduledDuration >= 60 ? `${task.scheduledDuration / 60}h` : `${task.scheduledDuration}m`}` : ""}</span>
            {!task.done && (
              <button
                type="button"
                onClick={() => startTimer({ taskId: task._id, projectId: task.projectId })}
                className="text-xs px-2 py-1 border font-medium"
                style={{ color, borderColor: color }}
              >
                ▶
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjectCard({ project }) {
  const updateNextAction = useMutation(api.projects.updateNextAction);
  const days = daysUntil(project.deadline);
  const tierColor = TIER_COLORS[project.tier] || "#2A2A2A";
  const progress = project.totalMilestones > 0
    ? { done: project.doneMilestones, total: project.totalMilestones }
    : { done: 0, total: 0 };

  return (
    <div
      className="bg-card border border-border p-4 flex flex-col gap-3"
      style={{ borderLeft: `3px solid ${tierColor}` }}
    >
      <div className="flex justify-between items-start">
        <Link to={`/project/${project._id}`} className="text-text font-semibold text-base hover:text-accent transition-colors no-underline">
          {project.name}
        </Link>
        {days !== null && (
          <span className="font-mono text-xs whitespace-nowrap ml-2 flex items-center gap-1.5">
            {days < 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E84038] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E84038]" />
              </span>
            )}
            <span style={{ color: days < 0 ? "#E84038" : days <= 7 ? "#E8A838" : "#6B6B6B" }}>
              {days < 0 ? `${Math.abs(days)}d overdue` : `${days} days left`}
            </span>
          </span>
        )}
      </div>

      <SegmentedProgress done={progress.done} total={progress.total} color={tierColor} />

      {project.currentPhase && (
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wide mb-1">Current phase</div>
          <div className="text-sm text-text">{project.currentPhase.title}</div>
        </div>
      )}

      <div>
        <div className="text-[11px] text-muted uppercase tracking-wide mb-1">Next action</div>
        <InlineEdit
          value={project.nextAction}
          onSave={(val) => updateNextAction({ id: project._id, nextAction: val })}
          placeholder="Define next action"
          className="text-sm"
        />
      </div>
    </div>
  );
}

export default function Home() {
  const projects = useQuery(api.projects.list);
  const alerts = useQuery(api.stats.getDashboardAlerts);
  const seed = useMutation(api.seed.run);
  const identity = useQuery(api.settings.get, { key: "identityStatement" });
  const setIdentity = useMutation(api.settings.set);

  if (projects === undefined) return <div className="text-muted p-8">Loading...</div>;

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted">No projects yet.</p>
        <button type="button" onClick={() => seed()} className="px-6 py-3 bg-accent text-bg font-medium">
          Load seed data
        </button>
      </div>
    );
  }

  const grouped = {};
  for (const tier of TIER_ORDER) {
    const items = projects.filter((p) => p.tier === tier);
    if (items.length > 0) grouped[tier] = items;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-text">{getGreeting()}, Mbaye</h1>
        <div className="font-mono text-sm text-muted">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {identity !== undefined && (
        <div className="mb-6">
          <InlineEdit
            value={identity || ""}
            onSave={(val) => setIdentity({ key: "identityStatement", value: val })}
            placeholder="Set your identity statement..."
            className="text-sm italic text-muted"
          />
        </div>
      )}

      <DailyPulse />

      {alerts && (alerts.missingNextAction.length > 0 || alerts.overdue.length > 0 || (alerts.daysSinceReview !== null && alerts.daysSinceReview > 7)) && (
        <div className="bg-accent/10 border border-accent/30 p-3 mb-6 flex flex-col gap-1">
          {alerts.missingNextAction.length > 0 && (
            <span className="text-sm text-accent">
              {alerts.missingNextAction.length} project{alerts.missingNextAction.length > 1 ? "s" : ""} missing a next action
            </span>
          )}
          {alerts.overdue.map((p) => (
            <span key={p._id} className="text-sm text-danger">{p.name} is overdue</span>
          ))}
          {alerts.daysSinceReview !== null && alerts.daysSinceReview > 7 && (
            <Link to="/review" className="text-sm no-underline" style={{ color: alerts.daysSinceReview > 14 ? "#E84038" : "#E8A838" }}>
              Weekly review due — last reviewed {alerts.daysSinceReview} days ago
            </Link>
          )}
        </div>
      )}

      <TodayStrip />
      <TodayBlocks />

      {TIER_ORDER.map((tier) =>
        grouped[tier] ? (
          <div key={tier} className="mb-8">
            <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_COLORS[tier] }} />
              <div className="w-[2px] h-4" style={{ backgroundColor: TIER_COLORS[tier] }} />
              <span className="text-[11px] font-medium text-muted uppercase tracking-widest">
                {TIER_LABELS[tier]}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped[tier].map((p) => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
