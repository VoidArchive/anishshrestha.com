/**
 * Conway's Game of Life - Predefined Patterns
 *
 * Collection of famous patterns from Conway's Game of Life including
 * oscillators, spaceships, still lifes, and other interesting configurations.
 */

import type { Pattern } from '../rules/types';
import { PatternCategory } from '../rules/types';

/**
 * Converts a string pattern representation to a 2D boolean grid
 * '.' = dead cell, any other character = living cell
 */
function parsePattern(patternString: string): boolean[][] {
	return patternString
		.trim()
		.split('\n')
		.map((row) => row.split('').map((char) => char !== '.'));
}

// Still Life Patterns (never change)
const BLOCK: Pattern = {
	name: 'Block',
	description: 'The simplest still life - a 2x2 square',
	grid: parsePattern(`
##
##`),
	width: 2,
	height: 2
};

const BEEHIVE: Pattern = {
	name: 'Beehive',
	description: 'A hexagonal still life',
	grid: parsePattern(`
.##.
#..#
.##.`),
	width: 4,
	height: 3
};

const LOAF: Pattern = {
	name: 'Loaf',
	description: 'A bread-shaped still life',
	grid: parsePattern(`
.##.
#..#
.#.#
..#.`),
	width: 4,
	height: 4
};

// Oscillator Patterns (cycle through states)
const BLINKER: Pattern = {
	name: 'Blinker',
	description: 'Period-2 oscillator - the simplest',
	grid: parsePattern(`
###`),
	width: 3,
	height: 1
};

const TOAD: Pattern = {
	name: 'Toad',
	description: 'Period-2 oscillator',
	grid: parsePattern(`
.###
###.`),
	width: 4,
	height: 2
};

const BEACON: Pattern = {
	name: 'Beacon',
	description: 'Period-2 oscillator with corner blocks',
	grid: parsePattern(`
##..
##..
..##
..##`),
	width: 4,
	height: 4
};

const PULSAR: Pattern = {
	name: 'Pulsar',
	description: 'Period-3 oscillator - large and spectacular',
	grid: parsePattern(`
..###...###..
.............
#....#.#....#
#....#.#....#
#....#.#....#
..###...###..
.............
..###...###..
#....#.#....#
#....#.#....#
#....#.#....#
.............
..###...###..`),
	width: 13,
	height: 13
};

// Spaceship Patterns (travel across the grid)
const GLIDER: Pattern = {
	name: 'Glider',
	description: 'The most famous spaceship - travels diagonally',
	grid: parsePattern(`
.#.
..#
###`),
	width: 3,
	height: 3
};

const LIGHT_SPACESHIP: Pattern = {
	name: 'Lightweight Spaceship',
	description: 'Fast horizontal spaceship',
	grid: parsePattern(`
.####
#...#
....#
#..#.`),
	width: 5,
	height: 4
};

// Complex Patterns
const GOSPER_GLIDER_GUN: Pattern = {
	name: 'Gosper Glider Gun',
	description: 'Produces gliders indefinitely - first known gun pattern',
	grid: parsePattern(`
........................#...........
......................#.#...........
............##......##............##
...........#...#....##............##
##........#.....#...##...............
##........#...#.##....#.#............
..........#.....#.......#............
...........#...#.....................
............##.......................`),
	width: 36,
	height: 9
};

const R_PENTOMINO: Pattern = {
	name: 'R-pentomino',
	description: 'Chaotic pattern that evolves for 1103 generations',
	grid: parsePattern(`
.##
##.
.#.`),
	width: 3,
	height: 3
};

// Pattern collections organized by category
export const PATTERNS_BY_CATEGORY = {
	[PatternCategory.STILL_LIFES]: [BLOCK, BEEHIVE, LOAF],
	[PatternCategory.OSCILLATORS]: [BLINKER, TOAD, BEACON, PULSAR],
	[PatternCategory.SPACESHIPS]: [GLIDER, LIGHT_SPACESHIP],
	[PatternCategory.RANDOM]: [GOSPER_GLIDER_GUN, R_PENTOMINO]
};

// Flat list of all patterns for easy access
export const ALL_PATTERNS: Pattern[] = Object.values(PATTERNS_BY_CATEGORY).flat();

/**
 * Gets a pattern by name
 */
export function getPatternByName(name: string): Pattern | undefined {
	return ALL_PATTERNS.find((pattern) => pattern.name === name);
}

/**
 * Gets all patterns in a specific category
 */
export function getPatternsByCategory(category: PatternCategory): Pattern[] {
	return PATTERNS_BY_CATEGORY[category] || [];
}

/**
 * Inserts a pattern into a grid at specified coordinates
 * Returns new grid with pattern applied (if it fits)
 */
export function insertPattern(
	grid: boolean[][],
	pattern: Pattern,
	startX: number,
	startY: number
): boolean[][] {
	const gridHeight = grid.length;
	const gridWidth = grid[0].length;

	// Check if pattern fits in the grid
	if (startX + pattern.width > gridWidth || startY + pattern.height > gridHeight) {
		return grid; // Pattern doesn't fit, return original grid
	}

	const newGrid = grid.map((row) => [...row]);

	// Apply pattern to the new grid
	for (let y = 0; y < pattern.height; y++) {
		for (let x = 0; x < pattern.width; x++) {
			if (pattern.grid[y] && pattern.grid[y][x]) {
				newGrid[startY + y][startX + x] = true;
			}
		}
	}

	return newGrid;
}
