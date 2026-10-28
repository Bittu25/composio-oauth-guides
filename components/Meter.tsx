import type { Guide } from "@/lib/schema";
import { DIFFICULTY } from "@/lib/labels";

const LEVEL: Record<Guide["difficulty"], number> = { easy: 1, moderate: 2, hard: 3, very_hard: 4 };

/** Four-segment difficulty meter with its label. */
export function Meter({ difficulty, showLabel = true }: { difficulty: Guide["difficulty"]; showLabel?: boolean }) {
  const n = LEVEL[difficulty];
  return (
    <span className={`meter meter-${difficulty}`} title={`Difficulty: ${DIFFICULTY[difficulty]}`}>
      <span className="meter-bars" aria-hidden>
        {[1, 2, 3, 4].map((i) => <i key={i} className={i <= n ? "on" : ""} />)}
      </span>
      {showLabel && <span className="meter-label">{DIFFICULTY[difficulty]}</span>}
    </span>
  );
}
