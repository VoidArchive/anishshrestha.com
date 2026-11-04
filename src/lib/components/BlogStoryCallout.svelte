<!-- Links a lab to the note that explains it. Default and banner: a ruled line; minimal: one caps line. -->
<script lang="ts">
	interface Props {
		blogTitle: string;
		blogUrl: string;
		blogDescription?: string;
		variant?: 'default' | 'banner' | 'minimal';
	}

	let { blogTitle, blogUrl, blogDescription, variant = 'default' }: Props = $props();
</script>

{#if variant === 'minimal'}
	<p class="meta line"><a href={blogUrl}>Read how it was built</a></p>
{:else}
	<aside class="story">
		<p class="meta">Read how it was built</p>
		<p class="title"><a href={blogUrl}>{blogTitle}</a></p>
		{#if blogDescription && variant === 'default'}
			<p class="what">{blogDescription}</p>
		{/if}
	</aside>
{/if}

<style>
	.story {
		margin: 0 0 24px;
		padding: 10px 0 14px;
		border-top: 1px solid var(--color-ink);
		border-bottom: 1px solid var(--color-ink);
	}
	.title {
		margin: 4px 0 0;
		font-size: 17px;
		font-weight: 600;
		line-height: 1.3;
		text-wrap: balance;
	}
	.title a {
		text-decoration: none;
	}
	.title a:hover {
		text-decoration: underline;
	}
	.what {
		margin: 6px 0 0;
		font-size: 15px;
		max-width: 60ch;
	}
	.line {
		margin: 24px 0 0;
		padding-top: 10px;
		border-top: 1px solid var(--color-ink);
	}
</style>
