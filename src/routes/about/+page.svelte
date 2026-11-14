<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { EMAIL, GITHUB, LINKEDIN, RESUME_URL } from '#lib/site.js';

	// Only what the projects on this site actually use
	const skills = [
		{ area: 'Backend', items: 'Go, ConnectRPC, Protobuf, REST, HMAC and RSA request signing' },
		{ area: 'Data', items: 'SQLite, PostgreSQL, sqlc' },
		{ area: 'Front end', items: 'SvelteKit, TypeScript, Tailwind' },
		{ area: 'Running it', items: 'Docker, Railway, Cloudflare Workers, Linux' }
	];
</script>

<Seo
	title="About | Anish Shrestha"
	description="About Anish Shrestha, a Go backend developer: what I build, the tools I use, my availability for remote and contract work, and how to reach me."
/>

<main class="page container">
	<h1 class="page-title">About</h1>
	<div class="prose-block">
		<p>
			I’m Anish Shrestha, a Go backend developer in Kathmandu. I like the plumbing: APIs, payment
			flows, and data that has to be right when it arrives.
		</p>
		<p>
			Most of what I’ve shipped is for Nepal’s financial systems. <a href="/projects/ntx">NTX</a> is
			a stock research platform for the Nepal Stock Exchange. The
			<a href="/projects/nepal-payment-go">payment SDK</a> puts eSewa, Khalti, ConnectIPS and
			FonePay behind one Go interface, and <a href="/projects/go-nepse">go-nepse</a> is a typed client
			for NEPSE’s market data.
		</p>
		<p>
			Right now I’m <a href="/system-design">learning system design in public</a> with AI as a pair. I
			only write up a lesson once a deployed project backs it.
		</p>
	</div>

	<section class="section" id="availability">
		<h2>Availability</h2>
		<div class="prose-block">
			<p>
				I’m open to remote backend roles and to contract work. Two things I can start on quickly:
			</p>
			<ul>
				<li>
					Payment integrations for Nepali companies: eSewa, Khalti, ConnectIPS or FonePay, including
					the callback verification.
				</li>
				<li>NEPSE market data in your product, through an API or straight into your database.</li>
			</ul>
		</div>
	</section>

	<section class="section">
		<h2>Skills</h2>
		<dl class="rows">
			{#each skills as s (s.area)}
				<div>
					<dt class="caps">{s.area}</dt>
					<dd>{s.items}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="section" id="contact">
		<h2>Contact</h2>
		<dl class="rows">
			<div>
				<dt class="caps">Email</dt>
				<dd><a href="mailto:{EMAIL}">{EMAIL}</a></dd>
			</div>
			<div>
				<dt class="caps">GitHub</dt>
				<dd><a href={GITHUB} rel="me">VoidArchive</a></dd>
			</div>
			<div>
				<dt class="caps">LinkedIn</dt>
				<dd><a href={LINKEDIN} rel="me">theinanish</a></dd>
			</div>
			<div>
				<dt class="caps">Résumé</dt>
				<dd>
					{#if RESUME_URL}
						<a href={RESUME_URL}>Download the PDF</a>
					{:else}
						<a href="mailto:{EMAIL}?subject=R%C3%A9sum%C3%A9">Email me and I’ll send it</a>
					{/if}
				</dd>
			</div>
		</dl>
	</section>
</main>

<style>
	.prose-block ul {
		margin: 0;
		padding-left: 1.2em;
		font-size: 17px;
		line-height: 1.6;
		max-width: 66ch;
	}
	.prose-block li {
		margin-bottom: 0.4em;
	}
	.prose-block li::marker {
		color: var(--color-spot-text);
	}
	.rows {
		margin: 0;
	}
	.rows div {
		display: grid;
		grid-template-columns: 160px minmax(0, 1fr);
		gap: 2px 24px;
		padding: 10px 0;
		border-top: 1px solid var(--color-ink);
	}
	.rows div:first-child {
		border-top: 0;
		padding-top: 0;
	}
	.rows dt {
		color: var(--color-spot-text);
		padding-top: 4px;
	}
	.rows dd {
		margin: 0;
		font-size: 17px;
	}
	@media (max-width: 520px) {
		.rows div {
			grid-template-columns: 1fr;
		}
	}
</style>
