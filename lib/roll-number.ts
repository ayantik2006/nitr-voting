function splitRoll(roll: string): { prefix: string; num: number } | null {
  const match = roll.match(/^(.*?)(\d+)$/);
  if (!match) return null;
  return { prefix: match[1], num: Number(match[2]) };
}

export function isRollNumberInRange(
  roll: string,
  from?: string,
  to?: string
): boolean {
  if (!from || !to) return true;

  const r = roll.toUpperCase();
  const f = from.toUpperCase();
  const t = to.toUpperCase();

  const rollParts = splitRoll(r);
  const fromParts = splitRoll(f);
  const toParts = splitRoll(t);

  if (
    rollParts &&
    fromParts &&
    toParts &&
    rollParts.prefix === fromParts.prefix &&
    rollParts.prefix === toParts.prefix
  ) {
    return rollParts.num >= fromParts.num && rollParts.num <= toParts.num;
  }

  return r >= f && r <= t;
}
