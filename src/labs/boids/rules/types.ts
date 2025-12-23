export interface Vector2D {
	x: number;
	y: number;
}

export interface Boid {
	id: number;
	position: Vector2D;
	velocity: Vector2D;
}

export interface SimulationParams {
	boidCount: number;
	maxSpeed: number;
	perceptionRadius: number;
	separationWeight: number;
	alignmentWeight: number;
	cohesionWeight: number;
	edgeMode: 'wrap' | 'bounce';
}

export interface SimulationStats {
	fps: number;
	boidCount: number;
}

export interface SimulationState {
	boids: Boid[];
	isRunning: boolean;
	params: SimulationParams;
	stats: SimulationStats;
	canvasSize: { width: number; height: number };
}

export const DEFAULT_PARAMS: SimulationParams = {
	boidCount: 150,
	maxSpeed: 4,
	perceptionRadius: 50,
	separationWeight: 1.5,
	alignmentWeight: 1.0,
	cohesionWeight: 1.0,
	edgeMode: 'wrap'
};
