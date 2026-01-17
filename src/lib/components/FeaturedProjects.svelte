<!--
Featured Projects Component

Showcases major external and GitHub projects.
Complements the LatestLabs component by focusing on production/GitHub projects
rather than interactive browser-based labs.
-->

<script lang="ts">
	import { FolderGit } from 'lucide-svelte';
	import MiniProjectCard from './MiniProjectCard.svelte';
</script>

<section class="section-card">
	<h2 class="section-title flex items-center gap-2">
		<FolderGit size={20} class="text-primary inline" /> Featured Projects
	</h2>
	<div class="flex flex-col gap-6">
		<MiniProjectCard
			title="nepal-payment-go – Unified Payment SDK"
			description="Production-ready Go SDK for Nepal's payment providers. Supports eSewa, Khalti, ConnectIPS, and FonePay with type-safe APIs. Handles HMAC and RSA signatures."
			tech={['Go', 'SDK', 'eSewa', 'Khalti']}
			repo="https://github.com/VoidArchive/nepal-payment-go"
		/>
		<MiniProjectCard
			title="go-nepse – NEPSE API Client"
			description="Type-safe Go client for Nepal Stock Exchange API. Features automatic WASM-based authentication, structured errors, and exponential backoff retries."
			tech={['Go', 'API', 'NEPSE', 'WASM']}
			repo="https://github.com/VoidArchive/go-nepse"
		/>
		<MiniProjectCard
			title="NTX – Stock Research Platform"
			description="Financial research platform for NEPSE. Go backend with Protobuf APIs and SvelteKit frontend. Live at ntx.anishshrestha.com"
			tech={['Go', 'SvelteKit', 'Protobuf', 'FinTech']}
			repo="https://github.com/voidarchive/ntx"
		/>
	</div>
</section>
