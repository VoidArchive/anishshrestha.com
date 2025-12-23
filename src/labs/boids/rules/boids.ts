import type { Boid, Vector2D, SimulationParams } from './types';

// Vector math utilities
export function add(a: Vector2D, b: Vector2D): Vector2D {
	return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Vector2D, b: Vector2D): Vector2D {
	return { x: a.x - b.x, y: a.y - b.y };
}

export function multiply(v: Vector2D, scalar: number): Vector2D {
	return { x: v.x * scalar, y: v.y * scalar };
}

export function divide(v: Vector2D, scalar: number): Vector2D {
	if (scalar === 0) return { x: 0, y: 0 };
	return { x: v.x / scalar, y: v.y / scalar };
}

export function magnitude(v: Vector2D): number {
	return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function magnitudeSquared(v: Vector2D): number {
	return v.x * v.x + v.y * v.y;
}

export function normalize(v: Vector2D): Vector2D {
	const mag = magnitude(v);
	if (mag === 0) return { x: 0, y: 0 };
	return divide(v, mag);
}

export function limit(v: Vector2D, max: number): Vector2D {
	const magSq = magnitudeSquared(v);
	if (magSq > max * max) {
		return multiply(normalize(v), max);
	}
	return v;
}

export function distance(a: Vector2D, b: Vector2D): number {
	return magnitude(subtract(a, b));
}

export function distanceSquared(a: Vector2D, b: Vector2D): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return dx * dx + dy * dy;
}

// Create a random boid
export function createBoid(id: number, width: number, height: number): Boid {
	const angle = Math.random() * Math.PI * 2;
	const speed = 2 + Math.random() * 2;
	return {
		id,
		position: {
			x: Math.random() * width,
			y: Math.random() * height
		},
		velocity: {
			x: Math.cos(angle) * speed,
			y: Math.sin(angle) * speed
		}
	};
}

// Create initial flock
export function createFlock(count: number, width: number, height: number): Boid[] {
	return Array.from({ length: count }, (_, i) => createBoid(i, width, height));
}

// Spatial hash for O(n) neighbor lookup instead of O(n²)
class SpatialHash {
	private cellSize: number;
	private grid: Map<string, Boid[]> = new Map();

	constructor(cellSize: number) {
		this.cellSize = cellSize;
	}

	clear(): void {
		this.grid.clear();
	}

	private getKey(x: number, y: number): string {
		const cellX = Math.floor(x / this.cellSize);
		const cellY = Math.floor(y / this.cellSize);
		return `${cellX},${cellY}`;
	}

	insert(boid: Boid): void {
		const key = this.getKey(boid.position.x, boid.position.y);
		const cell = this.grid.get(key);
		if (cell) {
			cell.push(boid);
		} else {
			this.grid.set(key, [boid]);
		}
	}

	// Get potential neighbors (boids in nearby cells)
	getNearby(boid: Boid, radius: number): Boid[] {
		const nearby: Boid[] = [];
		const cellX = Math.floor(boid.position.x / this.cellSize);
		const cellY = Math.floor(boid.position.y / this.cellSize);
		const cellRadius = Math.ceil(radius / this.cellSize);

		for (let dx = -cellRadius; dx <= cellRadius; dx++) {
			for (let dy = -cellRadius; dy <= cellRadius; dy++) {
				const key = `${cellX + dx},${cellY + dy}`;
				const cell = this.grid.get(key);
				if (cell) {
					nearby.push(...cell);
				}
			}
		}

		return nearby;
	}
}

// Reusable spatial hash instance
let spatialHash: SpatialHash | null = null;

// Find neighbors within perception radius using spatial hash
function getNeighbors(boid: Boid, boids: Boid[], radius: number): Boid[] {
	if (!spatialHash) return [];

	const radiusSq = radius * radius;
	const nearby = spatialHash.getNearby(boid, radius);

	return nearby.filter((other) => {
		if (other.id === boid.id) return false;
		return distanceSquared(boid.position, other.position) < radiusSq;
	});
}

// Rule 1: Separation - steer away from nearby boids
function separation(boid: Boid, neighbors: Boid[]): Vector2D {
	if (neighbors.length === 0) return { x: 0, y: 0 };

	let steeringX = 0;
	let steeringY = 0;

	for (const other of neighbors) {
		const dx = boid.position.x - other.position.x;
		const dy = boid.position.y - other.position.y;
		const distSq = dx * dx + dy * dy;
		if (distSq > 0) {
			// Weight by inverse distance squared (closer = stronger repulsion)
			const factor = 1 / distSq;
			steeringX += dx * factor;
			steeringY += dy * factor;
		}
	}

	return { x: steeringX / neighbors.length, y: steeringY / neighbors.length };
}

// Rule 2: Alignment - steer towards average heading of neighbors
function alignment(boid: Boid, neighbors: Boid[]): Vector2D {
	if (neighbors.length === 0) return { x: 0, y: 0 };

	let avgVx = 0;
	let avgVy = 0;

	for (const other of neighbors) {
		avgVx += other.velocity.x;
		avgVy += other.velocity.y;
	}

	avgVx /= neighbors.length;
	avgVy /= neighbors.length;

	// Steer towards average velocity
	return { x: avgVx - boid.velocity.x, y: avgVy - boid.velocity.y };
}

// Rule 3: Cohesion - steer towards center of mass of neighbors
function cohesion(boid: Boid, neighbors: Boid[]): Vector2D {
	if (neighbors.length === 0) return { x: 0, y: 0 };

	let centerX = 0;
	let centerY = 0;

	for (const other of neighbors) {
		centerX += other.position.x;
		centerY += other.position.y;
	}

	centerX /= neighbors.length;
	centerY /= neighbors.length;

	// Steer towards center of mass
	return { x: centerX - boid.position.x, y: centerY - boid.position.y };
}

// Handle edge wrapping or bouncing
function handleEdges(boid: Boid, width: number, height: number, mode: 'wrap' | 'bounce'): void {
	if (mode === 'wrap') {
		if (boid.position.x < 0) boid.position.x = width;
		if (boid.position.x > width) boid.position.x = 0;
		if (boid.position.y < 0) boid.position.y = height;
		if (boid.position.y > height) boid.position.y = 0;
	} else {
		const margin = 50;
		const turnFactor = 0.5;

		if (boid.position.x < margin) {
			boid.velocity.x += turnFactor;
		}
		if (boid.position.x > width - margin) {
			boid.velocity.x -= turnFactor;
		}
		if (boid.position.y < margin) {
			boid.velocity.y += turnFactor;
		}
		if (boid.position.y > height - margin) {
			boid.velocity.y -= turnFactor;
		}
	}
}

// Update all boids with spatial partitioning optimization
export function updateFlock(
	boids: Boid[],
	params: SimulationParams,
	width: number,
	height: number
): void {
	// Rebuild spatial hash each frame
	if (!spatialHash || spatialHash['cellSize'] !== params.perceptionRadius) {
		spatialHash = new SpatialHash(params.perceptionRadius);
	}
	spatialHash.clear();

	// Insert all boids into spatial hash
	for (const boid of boids) {
		spatialHash.insert(boid);
	}

	// Update each boid
	for (const boid of boids) {
		const neighbors = getNeighbors(boid, boids, params.perceptionRadius);

		// Calculate steering forces
		const sep = separation(boid, neighbors);
		const ali = alignment(boid, neighbors);
		const coh = cohesion(boid, neighbors);

		// Apply weighted forces
		boid.velocity.x += sep.x * params.separationWeight;
		boid.velocity.y += sep.y * params.separationWeight;
		boid.velocity.x += ali.x * params.alignmentWeight;
		boid.velocity.y += ali.y * params.alignmentWeight;
		boid.velocity.x += coh.x * params.cohesionWeight;
		boid.velocity.y += coh.y * params.cohesionWeight;

		// Limit speed
		boid.velocity = limit(boid.velocity, params.maxSpeed);

		// Update position
		boid.position.x += boid.velocity.x;
		boid.position.y += boid.velocity.y;

		// Handle edges
		handleEdges(boid, width, height, params.edgeMode);
	}
}

// Legacy single boid update (kept for compatibility but not used)
export function updateBoid(
	boid: Boid,
	boids: Boid[],
	params: SimulationParams,
	width: number,
	height: number
): void {
	const neighbors = getNeighbors(boid, boids, params.perceptionRadius);

	const sep = separation(boid, neighbors);
	const ali = alignment(boid, neighbors);
	const coh = cohesion(boid, neighbors);

	boid.velocity.x += sep.x * params.separationWeight;
	boid.velocity.y += sep.y * params.separationWeight;
	boid.velocity.x += ali.x * params.alignmentWeight;
	boid.velocity.y += ali.y * params.alignmentWeight;
	boid.velocity.x += coh.x * params.cohesionWeight;
	boid.velocity.y += coh.y * params.cohesionWeight;

	boid.velocity = limit(boid.velocity, params.maxSpeed);
	boid.position.x += boid.velocity.x;
	boid.position.y += boid.velocity.y;

	handleEdges(boid, width, height, params.edgeMode);
}
