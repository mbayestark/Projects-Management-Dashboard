import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Checkbox from "../components/Checkbox";
import InlineEdit from "../components/InlineEdit";

const TIER_COLORS = { critical: "#E84038", high: "#E8A838", responsibility: "#7B61FF" };
const CONTEXTS = [undefined, "deep_work", "quick", "errand"];
const CONTEXT_LABELS = { deep_work: "deep", quick: "quick", errand: "errand" };

function ContextBadge({ context, onCycle }) {
  const colors = { deep_work: "#E8A838", quick: "#22C55E", errand: "#6B6B6B" };
  if (!context) return (
    <button type="button" onClick={onCycle} className="text-[10px] text-border hover:text-muted px-1">ctx</button>
  );
  return (
    <button
      type="button"
      onClick={onCycle}
      className="text-[10px] px-1.5 py-0.5 border"
      style={{ color: colors[context], borderColor: colors[context] + "60" }}
    >
      {CONTEXT_LABELS[context]}
    </button>
  );
}

function TaskRow({ task, projectId }) {
  const toggleTask = useMutation(api.tasks.toggle);
  const updateContext = useMutation(api.tasks.updateContext);
  const updateTitle = useMutation(api.tasks.updateTitle);
  const updateSchedule = useMutation(api.tasks.updateSchedule);
  const clearSchedule = useMutation(api.tasks.clearSchedule);
  const startTimer = useMutation(api.timer.start);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedDate, setSchedDate] = useState(task.scheduledDate || "");
  const [schedStart, setSchedStart] = useState(task.scheduledStart || "");
  const [schedDuration, setSchedDuration] = useState(task.scheduledDuration || "");

  useEffect(() => {
    setSchedDate(task.scheduledDate || "");
    setSchedStart(task.scheduledStart || "");
    setSchedDuration(task.scheduledDuration || "");
  }, [task.scheduledDate, task.scheduledStart, task.scheduledDuration]);

  function cycleContext() {
    const idx = CONTEXTS.indexOf(task.context || null);
    const next = CONTEXTS[(idx + 1) % CONTEXTS.length];
    updateContext({ id: task._id, context: next });
  }

  function saveSchedule() {
    updateSchedule({
      id: task._id,
      scheduledDate: schedDate || undefined,
      scheduledStart: schedStart || undefined,
      scheduledDuration: schedDuration ? parseInt(schedDuration) : undefined,
    });
    setShowSchedule(false);
  }

  return (
    <div className="pl-6">
      <div className="flex items-center gap-2 py-1.5 group">
        <Checkbox checked={task.done} onChange={() => toggleTask({ id: task._id })} />
        <InlineEdit
          value={task.title}
          onSave={(val) => updateTitle({ id: task._id, title: val })}
          className={`text-sm flex-1 ${task.done ? "line-through text-muted" : ""}`}
        />
        <ContextBadge context={task.context} onCycle={cycleContext} />
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className={`text-[10px] px-1 ${task.scheduledDate ? "text-accent" : "text-muted hover:text-accent opacity-0 group-hover:opacity-100"} transition-opacity`}
          title="Schedule"
        >
          {task.scheduledDate ? `📅 ${task.scheduledDate}` : "📅"}
        </button>
        {!task.done && (
          <button
            type="button"
            onClick={() => startTimer({ taskId: task._id, projectId })}
            className="text-[10px] text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ▶
          </button>
        )}
      </div>
      {showSchedule && (
        <div className="flex items-center gap-2 py-2 pl-6 flex-wrap">
          <input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)}
            className="bg-card border border-border px-2 py-1 text-xs text-text outline-none" />
          <input type="time" value={schedStart} onChange={(e) => setSchedStart(e.target.value)}
            className="bg-card border border-border px-2 py-1 text-xs text-text outline-none" />
          <input type="number" value={schedDuration} onChange={(e) => setSchedDuration(e.target.value)}
            placeholder="min" className="bg-card border border-border px-2 py-1 text-xs text-text outline-none w-16" />
          <button type="button" onClick={saveSchedule} className="text-xs text-accent hover:underline">Save</button>
          {task.scheduledDate && (
            <button type="button" onClick={() => {
              clearSchedule({ id: task._id });
              setSchedDate(""); setSchedStart(""); setSchedDuration("");
              setShowSchedule(false);
            }} className="text-xs text-muted hover:text-danger">Clear</button>
          )}
        </div>
      )}
    </div>
  );
}

function MilestoneSection({ milestone, projectId }) {
  const toggleMilestone = useMutation(api.milestones.toggle);
  const createTask = useMutation(api.tasks.create);
  const deleteMilestone = useMutation(api.milestones.deleteMilestone);
  const [expanded, setExpanded] = useState(!milestone.done);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const tasks = milestone.tasks || [];
  const doneCount = tasks.filter((t) => t.done).length;

  function handleAddTask() {
    if (!newTitle.trim()) return;
    createTask({ milestoneId: milestone._id, projectId, title: newTitle.trim(), order: tasks.length });
    setNewTitle("");
    setAdding(false);
  }

  return (
    <div className="border border-border mb-2">
      <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-card/50" onClick={() => setExpanded(!expanded)}>
        <span className="text-muted text-xs">{expanded ? "▼" : "▶"}</span>
        {tasks.length === 0 && (
          <span onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={milestone.done} onChange={() => toggleMilestone({ id: milestone._id })} />
          </span>
        )}
        <span className={`flex-1 text-sm ${milestone.done ? "line-through text-muted" : "text-text"}`}>
          {milestone.title}
        </span>
        {tasks.length > 0 && <span className="font-mono text-xs text-muted">{doneCount}/{tasks.length}</span>}
      </div>
      {expanded && (
        <div className="px-3 pb-3">
          {tasks.map((task) => <TaskRow key={task._id} task={task} projectId={projectId} />)}
          {adding ? (
            <div className="pl-6 mt-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                  if (e.key === "Escape") { setAdding(false); setNewTitle(""); }
                }}
                placeholder="Task title"
                className="w-full bg-transparent border-b border-border text-sm text-text outline-none py-1"
                autoFocus
              />
            </div>
          ) : (
            <button type="button" onClick={() => setAdding(true)} className="text-sm text-muted hover:text-accent pl-6 mt-2">
              + Add task
            </button>
          )}
          <button
            type="button"
            onClick={() => { if (confirm("Delete this milestone and all its tasks?")) deleteMilestone({ id: milestone._id }); }}
            className="text-xs text-muted hover:text-danger pl-6 mt-2 block"
          >
            Delete milestone
          </button>
        </div>
      )}
    </div>
  );
}

function PhaseSection({ phase, milestones, projectId }) {
  const [expanded, setExpanded] = useState(!phase.done);
  const phaseMilestones = milestones.filter((m) => m.phaseId === phase._id);
  const status = phase.done ? "✅ Complete" : phaseMilestones.some((m) => m.tasks?.some((t) => t.done)) ? "🔄 In progress" : "⬜ Pending";

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 cursor-pointer py-2" onClick={() => setExpanded(!expanded)}>
        <span className="text-muted text-xs">{expanded ? "▼" : "▶"}</span>
        <span className={`text-sm font-semibold flex-1 ${phase.done ? "text-muted" : "text-text"}`}>
          {phase.title}
        </span>
        <span className="text-xs text-muted">{status}</span>
      </div>
      {expanded && phaseMilestones.map((m) => (
        <MilestoneSection key={m._id} milestone={m} projectId={projectId} />
      ))}
    </div>
  );
}

function NotesLog({ projectId, noteLogs }) {
  const addEntry = useMutation(api.noteLogs.addEntry);
  const [note, setNote] = useState("");

  return (
    <div className="mb-6">
      <div className="text-[11px] text-muted uppercase tracking-wide mb-3">Notes</div>
      {noteLogs.map((entry) => (
        <div key={entry._id} className="mb-3 pl-3 border-l border-border">
          <div className="text-xs text-muted mb-1 font-mono">{entry.date}</div>
          <div className="text-sm text-text whitespace-pre-wrap">{entry.content}</div>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && note.trim()) {
              addEntry({ projectId, content: note.trim() });
              setNote("");
            }
          }}
          placeholder="Add note for today..."
          className="flex-1 bg-card border border-border px-3 py-2 text-sm text-text outline-none"
        />
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useQuery(api.projects.get, { id });
  const updateNextAction = useMutation(api.projects.updateNextAction);
  const parkProject = useMutation(api.projects.park);
  const createMilestone = useMutation(api.milestones.create);
  const createPhase = useMutation(api.phases.create);
  const logTime = useMutation(api.timeLogs.log);

  const [addingMilestone, setAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [addingPhase, setAddingPhase] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [logMinutes, setLogMinutes] = useState("");
  const [logNote, setLogNote] = useState("");

  if (project === undefined) return <div className="text-muted p-8">Loading...</div>;
  if (!project) return <div className="text-muted p-8">Project not found.</div>;

  const tierColor = TIER_COLORS[project.tier] || "#6B6B6B";
  const hasPhases = project.phases && project.phases.length > 0;
  const orphanMilestones = (project.milestones || []).filter((m) => !m.phaseId);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <button type="button" onClick={() => navigate(-1)} className="text-sm text-muted hover:text-text mb-4">← Back</button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text mb-2">{project.name}</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs px-2 py-0.5 text-bg" style={{ backgroundColor: tierColor }}>{project.tier}</span>
          <span className="text-xs text-muted">{project.category}</span>
          {project.deadline && <span className="text-xs font-mono text-muted">Due {project.deadline}</span>}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[11px] text-muted uppercase tracking-wide mb-2">Next action</div>
        <InlineEdit
          value={project.nextAction}
          onSave={(val) => updateNextAction({ id: project._id, nextAction: val })}
          placeholder="Define next action"
          className="text-base"
        />
      </div>

      <div className="mb-6">
        <div className="text-[11px] text-muted uppercase tracking-wide mb-3">
          {hasPhases ? "Phases & Milestones" : "Milestones & Tasks"}
        </div>

        {hasPhases && project.phases.map((phase) => (
          <PhaseSection key={phase._id} phase={phase} milestones={project.milestones} projectId={project._id} />
        ))}

        {orphanMilestones.map((m) => (
          <MilestoneSection key={m._id} milestone={m} projectId={project._id} />
        ))}

        {addingMilestone ? (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newMilestoneTitle.trim()) {
                  createMilestone({ projectId: project._id, title: newMilestoneTitle.trim(), order: (project.milestones || []).length });
                  setNewMilestoneTitle("");
                  setAddingMilestone(false);
                }
                if (e.key === "Escape") { setAddingMilestone(false); setNewMilestoneTitle(""); }
              }}
              placeholder="Milestone title"
              className="flex-1 bg-transparent border-b border-border text-sm text-text outline-none py-1"
              autoFocus
            />
          </div>
        ) : (
          <div className="flex gap-4 mt-2">
            <button type="button" onClick={() => setAddingMilestone(true)} className="text-sm text-muted hover:text-accent">+ Add milestone</button>
            {!hasPhases && !addingPhase && (
              <button type="button" onClick={() => setAddingPhase(true)} className="text-sm text-muted hover:text-accent">+ Add phase</button>
            )}
          </div>
        )}

        {hasPhases && !addingPhase && (
          <button type="button" onClick={() => setAddingPhase(true)} className="text-sm text-muted hover:text-accent mt-2">+ Add phase</button>
        )}

        {addingPhase && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newPhaseTitle}
              onChange={(e) => setNewPhaseTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newPhaseTitle.trim()) {
                  createPhase({ projectId: project._id, title: newPhaseTitle.trim(), order: (project.phases || []).length });
                  setNewPhaseTitle("");
                  setAddingPhase(false);
                }
                if (e.key === "Escape") { setAddingPhase(false); setNewPhaseTitle(""); }
              }}
              placeholder="Phase title"
              className="flex-1 bg-transparent border-b border-border text-sm text-text outline-none py-1"
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="text-[11px] text-muted uppercase tracking-wide mb-2">Log time</div>
        <div className="flex gap-2 items-center">
          <input type="number" value={logMinutes} onChange={(e) => setLogMinutes(e.target.value)}
            placeholder="Minutes" className="bg-card border border-border px-3 py-2 text-sm text-text outline-none w-24" />
          <input type="text" value={logNote} onChange={(e) => setLogNote(e.target.value)}
            placeholder="Note (optional)" className="bg-card border border-border px-3 py-2 text-sm text-text outline-none flex-1" />
          <button type="button" onClick={() => {
            if (logMinutes) { logTime({ projectId: project._id, minutes: parseInt(logMinutes), date: today, note: logNote || undefined }); setLogMinutes(""); setLogNote(""); }
          }} className="px-4 py-2 bg-accent text-bg text-sm font-medium">Log</button>
        </div>
      </div>

      <NotesLog projectId={project._id} noteLogs={project.noteLogs || []} />

      {project.originIdeaId && (
        <div className="mb-6 text-sm text-muted">
          Origin: promoted from idea
        </div>
      )}

      <button type="button" onClick={() => { parkProject({ id: project._id }); navigate("/"); }}
        className="text-sm text-muted hover:text-danger border border-border px-4 py-2">
        Park project
      </button>
    </div>
  );
}
