const LS_KEY = '2hugame.hiscore';

export class Scoring {
	score = 0;
	hiScore = 0;
	private newHighScore = false;

	constructor() {
		try {
			this.hiScore = Number(localStorage.getItem(LS_KEY) ?? 0) || 0;
		} catch {
			this.hiScore = 0;
		}
	}

	add(points: number): void {
		this.score += Math.max(0, Math.floor(points));
	}

	get rank(): string {
		const s = this.score;
		if (s >= 3_000_000) return 'S';
		if (s >= 2_000_000) return 'A';
		if (s >= 1_200_000) return 'B';
		if (s >= 600_000) return 'C';
		if (s >= 300_000) return 'D';
		return 'E';
	}

	finish(): void {
		if (this.score > this.hiScore) {
			this.hiScore = this.score;
			this.newHighScore = true;
			try {
				localStorage.setItem(LS_KEY, String(this.hiScore));
			} catch {
				// ignore
			}
		}
	}

	get isNewHighScore(): boolean {
		return this.newHighScore;
	}
}
