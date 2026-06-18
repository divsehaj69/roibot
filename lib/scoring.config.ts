// All weights and thresholds for the v2 scoring engine.
// These are tunable constants. Edit ONLY this file to adjust scoring behaviour.

// ── Volume gate ───────────────────────────────────────────────────────────────

export const VOLUME_GATE_MIN = 10; // volume < this → DON'T immediately

// ── Axis A — Worth It = TimeFactor × VolumeFactor ────────────────────────────

// VolumeFactor by monthly volume band (volumes < VOLUME_GATE_MIN are already gated)
export const VOLUME_FACTOR: Record<string, number> = {
  UNDER_100:  0.4,   // 10–99
  MID:        0.7,   // 100–999
  HIGH:       0.9,   // 1 000–9 999
  VERY_HIGH:  1.0,   // 10 000+
};

export const VOLUME_BREAKPOINTS = {
  UNDER_100: 100,
  MID:       1000,
  HIGH:      10000,
} as const;

export const TIME_FACTOR: Record<string, number> = {
  QUICK:    30,   // < 5 min
  MODERATE: 65,   // 5–30 min
  LONG:     100,  // 30+ min
};

// ── Worth It gates ────────────────────────────────────────────────────────────

export const WORTH_IT_GATES = {
  LOW_VALUE_MIN: 35,  // WorthIt below this → DON'T (low-value gate)
  DATA_GATE_MIN: 50,  // WorthIt below this with messy/unsure data → DON'T
};

// ── Axis B — Needs Custom ─────────────────────────────────────────────────────

export const CONSTRAINT_POINTS: Record<string, number> = {
  REGULATION: 80,
  PRIVACY:    70,
  NONE:       25,
  TIMELINE:   20,
  NO_ENG:     15,
};

export const DATA_MESSY_BONUS = 15;  // added to NeedsCustom if data is MESSY or UNSURE
export const NEEDS_CUSTOM_CAP = 100;

// ── Grid thresholds ───────────────────────────────────────────────────────────

export const GRID = {
  WORTH_IT_HIGH:      65,   // WorthIt >= this → high row
  NEEDS_CUSTOM_LOW:   40,   // NeedsCustom < this  → BUY column
  NEEDS_CUSTOM_HIGH:  65,   // NeedsCustom >= this → BUILD column
};

// ── Confidence thresholds (distance to nearest flip boundary) ─────────────────

export const CONFIDENCE = {
  HIGH_MIN:   16,   // > 15 pts away → High
  MEDIUM_MIN:  6,   // 6–15 pts away → Medium
  // <= 5 → Low
};
