---
title: 'Boids in a Small Box'
slug: 'boids-in-a-small-box'
description: 'The boids lab runs 150 birds on a big canvas. The home page shows 120 in a 600 by 400 plate, and the same rules looked wrong there. What cohesion, perception radius, and edge handling do when the box shrinks.'
date: '2026-11-04'
published: true
tags: ['boids', 'simulation', 'canvas', 'typescript']
labSlug: 'boids'
relatedLab:
  name: 'Boids Flocking'
  url: '/labs/boids'
  description: 'Separation, alignment and cohesion with every weight on a slider, and a wrap or bounce edge'
---

Reynolds' boids are three rules. Each bird steers away from neighbours that are too close (separation), toward the average heading of its neighbours (alignment), and toward their centre of mass (cohesion). The lab on this site runs them with these defaults:

```ts
export const DEFAULT_PARAMS = {
	boidCount: 150,
	maxSpeed: 4,
	perceptionRadius: 50,
	separationWeight: 1.5,
	alignmentWeight: 1.0,
	cohesionWeight: 1.0,
	edgeMode: 'wrap'
};
```

On the lab's canvas, roughly 900 by 600 pixels, that produces the thing you want: bands of birds wheeling around and reforming. When I put the same engine on the home page as Fig. 2, in a 600 by 400 plate with 120 birds, it produced something else. Within a few seconds the flock collapsed into five or six tight clumps that drifted around like blobs. The rules were the same. The box was smaller.

## Why the box matters

Cohesion pulls each bird toward the centre of everyone within its perception radius. With a radius of 50 pixels in a 600 by 400 plate, a bird's neighbourhood covers about three percent of the area, and with 120 birds that is four neighbours on average at the start. Once two birds join, their combined pull catches a third, and the clump is self-reinforcing. Separation at 1.5 is not strong enough to hold them apart, because it only acts on very close neighbours, and by then alignment has matched their headings so they never leave.

On the larger canvas the same radius covers less of the area, the neighbourhoods are sparser, and the clumps take much longer to form, long enough that the flock looks like a flock for as long as anyone watches.

## The numbers that worked

For the small plate I changed three values:

```ts
const params = {
	...DEFAULT_PARAMS,
	boidCount: 120,
	perceptionRadius: 36,
	cohesionWeight: 0.5,
	separationWeight: 2
};
```

A smaller radius shrinks each neighbourhood. Halving cohesion weakens the pull that forms clumps. Doubling separation gives birds that do get close a stronger push apart. The flock still forms groups, but they are loose and they break up, which is what a flock in a small space should look like.

## Wrap versus bounce

The lab offers two edge modes. Wrap teleports a bird that crosses an edge to the opposite side. Bounce was supposed to turn birds back before they left. The original bounce looked like this:

```ts
const margin = 50;
const turnFactor = 0.5;
if (boid.position.x < margin) boid.velocity.x += turnFactor;
if (boid.position.x > width - margin) boid.velocity.x -= turnFactor;
```

That is a steering force, not a wall. A bird at max speed 4 entering the margin at 50 pixels gains half a pixel per frame of reverse velocity. It takes eight frames to stop and another eight to come back, sixty pixels in all. So it leaves the plate, vanishes, and returns. The two modes looked identical, and a reader told me the toggle did nothing.

The fix keeps the gentle steering, because it makes turns look natural, and adds a hard reflection at the edge itself:

```ts
if (boid.position.x < 0) {
	boid.position.x = 0;
	boid.velocity.x = Math.abs(boid.velocity.x);
} else if (boid.position.x > width) {
	boid.position.x = width;
	boid.velocity.x = -Math.abs(boid.velocity.x);
}
```

Now a bird that reaches the border bounces off it, and the mode is visibly different from wrap.

## The trail

One more thing changed for the light theme. The lab draws motion trails by painting a translucent rectangle over the whole canvas each frame instead of clearing it. On the old dark site that rectangle was black at 15 percent. On white it is white at 15 percent, read from the page's colour tokens so the canvas follows the theme:

```ts
ctx.fillStyle = styles.getPropertyValue('--color-paper');
ctx.globalAlpha = 0.15;
ctx.fillRect(0, 0, width, height);
```

Same effect, inverted ink. Open the lab and drag cohesion up to see the clumps form on purpose.
