import { useState } from "react";

export default function Checkbox({ checked, onChange }) {
  const [pulsing, setPulsing] = useState(false);

  function handleClick() {
    if (!checked) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 150);
    }
    onChange(!checked);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-5 h-5 shrink-0 border flex items-center justify-center transition-colors ${
        checked
          ? "bg-accent border-accent"
          : "border-muted bg-transparent hover:border-text"
      } ${pulsing ? "checkbox-pulse" : ""}`}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
