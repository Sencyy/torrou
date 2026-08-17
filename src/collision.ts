export function circleHit(
	x1: number,
	y1: number,
	r1: number,
	x2: number,
	y2: number,
	r2: number,
): boolean {
	const dx = x1 - x2;
	const dy = y1 - y2;
	const rr = r1 + r2;
	return dx * dx + dy * dy <= rr * rr;
}

export function dist2(ax: number, ay: number, bx: number, by: number): number {
	const dx = ax - bx;
	const dy = ay - by;
	return dx * dx + dy * dy;
}

export function clamp(v: number, lo: number, hi: number): number {
	return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}
