// Shared canvas drawing helpers for the anime-style visuals.

export function hexA(hex: string, a: number): string {
	const h = hex.replace('#', '');
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function glowCircle(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	r: number,
	color: string,
	alpha = 0.5,
): void {
	const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
	g.addColorStop(0, hexA(color, alpha));
	g.addColorStop(1, hexA(color, 0));
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
}

export function roundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	const rr = Math.max(0, Math.min(r, w / 2, h / 2));
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.lineTo(x + w - rr, y);
	ctx.arcTo(x + w, y, x + w, y + rr, rr);
	ctx.lineTo(x + w, y + h - rr);
	ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
	ctx.lineTo(x + rr, y + h);
	ctx.arcTo(x, y + h, x, y + h - rr, rr);
	ctx.lineTo(x, y + rr);
	ctx.arcTo(x, y, x + rr, y, rr);
	ctx.closePath();
}

export function starPath(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	r: number,
	points = 4,
	rot = 0,
): void {
	ctx.beginPath();
	for (let i = 0; i < points * 2; i++) {
		const rad = i % 2 === 0 ? r : r * 0.38;
		const a = rot + (i / (points * 2)) * Math.PI * 2;
		const px = x + Math.cos(a) * rad;
		const py = y + Math.sin(a) * rad;
		if (i === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}
	ctx.closePath();
}

export function sparkle(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	r: number,
	color: string,
	alpha: number,
): void {
	if (alpha <= 0) return;
	ctx.save();
	ctx.globalAlpha = Math.min(1, alpha);
	ctx.fillStyle = color;
	starPath(ctx, x, y, r, 4, Math.PI / 4);
	ctx.fill();
	ctx.restore();
}
