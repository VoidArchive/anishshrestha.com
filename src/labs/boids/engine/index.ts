import type { SimulationState } from '../rules/types';
import { updateFlock, createFlock } from '../rules/boids';
import { DEFAULT_PARAMS } from '../rules/types';

export class BoidsEngine {
	private animationId: number | null = null;
	private lastTime = 0;
	private frameCount = 0;
	private fpsTime = 0;

	createInitialState(width: number, height: number): SimulationState {
		return {
			boids: createFlock(DEFAULT_PARAMS.boidCount, width, height),
			isRunning: false,
			params: { ...DEFAULT_PARAMS },
			stats: { fps: 0, boidCount: DEFAULT_PARAMS.boidCount },
			canvasSize: { width, height }
		};
	}

	start(state: SimulationState): void {
		if (state.isRunning) return;
		state.isRunning = true;
		this.lastTime = performance.now();
		this.fpsTime = this.lastTime;
		this.frameCount = 0;
		this.animate(state);
	}

	stop(state: SimulationState): void {
		state.isRunning = false;
		if (this.animationId !== null) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}

	toggle(state: SimulationState): void {
		if (state.isRunning) {
			this.stop(state);
		} else {
			this.start(state);
		}
	}

	reset(state: SimulationState): void {
		this.stop(state);
		const { width, height } = state.canvasSize;
		state.boids = createFlock(state.params.boidCount, width, height);
		state.stats.boidCount = state.params.boidCount;
		state.stats.fps = 0;
	}

	updateBoidCount(state: SimulationState, count: number): void {
		const { width, height } = state.canvasSize;
		const currentCount = state.boids.length;

		if (count > currentCount) {
			// Add more boids
			for (let i = currentCount; i < count; i++) {
				state.boids.push({
					id: i,
					position: { x: Math.random() * width, y: Math.random() * height },
					velocity: {
						x: (Math.random() - 0.5) * 4,
						y: (Math.random() - 0.5) * 4
					}
				});
			}
		} else if (count < currentCount) {
			// Remove boids
			state.boids.length = count;
		}

		state.params.boidCount = count;
		state.stats.boidCount = count;
	}

	updateCanvasSize(state: SimulationState, width: number, height: number): void {
		state.canvasSize = { width, height };
	}

	destroy(state: SimulationState): void {
		this.stop(state);
	}

	private animate(state: SimulationState): void {
		if (!state.isRunning) return;

		const now = performance.now();

		// Update FPS every second
		this.frameCount++;
		if (now - this.fpsTime >= 1000) {
			state.stats.fps = Math.round((this.frameCount * 1000) / (now - this.fpsTime));
			this.frameCount = 0;
			this.fpsTime = now;
		}

		// Update simulation
		updateFlock(state.boids, state.params, state.canvasSize.width, state.canvasSize.height);

		this.lastTime = now;
		this.animationId = requestAnimationFrame(() => this.animate(state));
	}
}
