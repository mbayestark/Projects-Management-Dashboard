import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Parked() {
  const projects = useQuery(api.projects.listParked);
  const unpark = useMutation(api.projects.unpark);

  if (projects === undefined) return <div className="text-muted p-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-6">Parked Projects</h1>
      {projects.length === 0 ? (
        <p className="text-muted text-sm">No parked projects.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((p) => (
            <div key={p._id} className="flex justify-between items-center border border-border p-3">
              <span className="text-sm text-muted">{p.name}</span>
              <button
                type="button"
                onClick={() => unpark({ id: p._id })}
                className="text-xs text-accent hover:underline"
              >
                Unpark
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
