<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { BoidsShell } from '#labs/boids/index.js';
</script>

<Seo
	title="Boids Flocking | Anish Shrestha"
	description="A live boids flocking simulation: tune separation, alignment, cohesion, speed and perception and watch a flock emerge from three rules."
/>

<BoidsShell />

<div class="container pb-8 lg:pb-12">
	<section class="section rules" id="about">
		<h2>How boids work</h2>
		<p class="intro">
			Boids are a model of flocking that Craig Reynolds came up with in 1986. Each boid only sees
			the neighbours inside its perception radius and has no idea where the rest of the flock is
			going. Put a few hundred of them on screen and they still end up moving together.
		</p>

		<div class="cols">
			<div>
				<h3>The three rules</h3>
				<dl>
					<div>
						<dt class="caps">Separation</dt>
						<dd>Steer away from neighbours. The closer one is, the harder the push.</dd>
					</div>
					<div>
						<dt class="caps">Alignment</dt>
						<dd>Turn toward the average heading of the neighbours.</dd>
					</div>
					<div>
						<dt class="caps">Cohesion</dt>
						<dd>Steer toward the average position of the neighbours.</dd>
					</div>
				</dl>
				<p>
					Every frame, a boid works out all three, multiplies each by its weight and adds them to
					its velocity. Then the speed gets capped and it moves. To find neighbours quickly, the
					boids are sorted into a grid of cells as wide as the perception radius, so each one only
					checks the cells around it.
				</p>
			</div>

			<div>
				<h3>The controls</h3>
				<dl>
					<div>
						<dt class="caps">Boids</dt>
						<dd>How many are on screen, from 10 to 500.</dd>
					</div>
					<div>
						<dt class="caps">Speed</dt>
						<dd>Max speed. No boid goes faster than this, whatever the rules ask for.</dd>
					</div>
					<div>
						<dt class="caps">Perception</dt>
						<dd>How far a boid can see, in pixels. Only boids inside it count as neighbours.</dd>
					</div>
					<div>
						<dt class="caps">Weights</dt>
						<dd>
							Separation, alignment and cohesion each get a slider from 0 to 5. At 0 that rule is
							off.
						</dd>
					</div>
					<div>
						<dt class="caps">Edges</dt>
						<dd>
							Wrap sends a boid off one side and back in on the other. Bounce steers it away from
							the walls and turns it around if it still hits one.
						</dd>
					</div>
				</dl>
				<p>
					Under the canvas there’s a Play/Pause button and Reset, which scatters a fresh flock with
					your current settings.
				</p>
			</div>
		</div>

		<p class="more">
			<a href="/blog/boids-in-a-small-box">What these rules do when the box gets small</a>
		</p>
	</section>
</div>
