export default function SegmentedProgress({ done, total, color = "#E8A838" }) {
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5 flex-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="h-2 flex-1"
            style={{ backgroundColor: i < done ? color : "#1F1F1F" }}
          />
        ))}
      </div>
      <span className="font-mono text-xs text-muted whitespace-nowrap">
        {done} / {total}
      </span>
    </div>
  );
}
