/**
 * Mathematical utilities for Embeddings, Geometry and Computer Vision
 * Directly implements formulas highlighted in the presentation slides
 */

export function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function manhattanDistance(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum;
}

export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function vectorMagnitude(a: number[]): number {
  return Math.sqrt(dotProduct(a, a));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = vectorMagnitude(a);
  const magB = vectorMagnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

/**
 * Normalizes a vector to unit length
 */
export function normalize(v: number[]): number[] {
  const mag = vectorMagnitude(v);
  if (mag === 0) return v.map(() => 0);
  return v.map(x => x / mag);
}

/**
 * Calculates the angular bisector vector between two 2D vectors u and v.
 * Formula from Slide 6:
 * Bissetriz = unit(u) + unit(v)
 * The bisector divides the angle between two vectors symmetrically.
 */
export function calculateBisector(
  origin: { x: number; y: number },
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
): {
  bisectorVec: { x: number; y: number };
  angleTotalDeg: number;
  angleHalfDeg: number;
  symmetryIndex: number;
} {
  const u = [pointA.x - origin.x, pointA.y - origin.y];
  const v = [pointB.x - origin.x, pointB.y - origin.y];

  const uHat = normalize(u);
  const vHat = normalize(v);

  // Sum of normalized unit vectors gives the bisector direction
  const bX = uHat[0] + vHat[0];
  const bY = uHat[1] + vHat[1];
  const bMag = Math.sqrt(bX * bX + bY * bY);

  const bisectorVec = bMag > 0 ? { x: bX / bMag, y: bY / bMag } : { x: 0, y: 1 };

  // Angle between u and v
  const cosTheta = Math.max(-1, Math.min(1, dotProduct(uHat, vHat)));
  const angleTotalRad = Math.acos(cosTheta);
  const angleTotalDeg = (angleTotalRad * 180) / Math.PI;
  const angleHalfDeg = angleTotalDeg / 2;

  // Symmetry index: how close the lengths of u and v are, plus balance
  const lenU = vectorMagnitude(u);
  const lenV = vectorMagnitude(v);
  const ratio = Math.min(lenU, lenV) / (Math.max(lenU, lenV) || 1);
  const symmetryIndex = Math.round(ratio * 100);

  return {
    bisectorVec,
    angleTotalDeg,
    angleHalfDeg,
    symmetryIndex,
  };
}

/**
 * Hough Transform Line Calculation:
 * ρ = x * cos(θ) + y * sin(θ)
 */
export function houghRho(x: number, y: number, thetaRad: number): number {
  return x * Math.cos(thetaRad) + y * Math.sin(thetaRad);
}

/**
 * Eye Aspect Ratio (EAR) formula for facial fatigue detection:
 * EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
 */
export function calculateEAR(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number],
  p5: [number, number],
  p6: [number, number]
): number {
  const dist26 = Math.hypot(p2[0] - p6[0], p2[1] - p6[1]);
  const dist35 = Math.hypot(p3[0] - p5[0], p3[1] - p5[1]);
  const dist14 = Math.hypot(p1[0] - p4[0], p1[1] - p4[1]);
  if (dist14 === 0) return 0;
  return (dist26 + dist35) / (2.0 * dist14);
}

/**
 * Calculates angle in degrees formed by three points (A -> B -> C)
 */
export function angleBetweenPoints(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);

  if (magAB === 0 || magCB === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cos) * 180) / Math.PI;
}
