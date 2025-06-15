// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { GameRoomDurableObject } from '$core/server/GameRoomDurableObject';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				GAME_ROOMS: DurableObjectNamespace;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage;
		}
	}
}

// Export for Cloudflare Pages
export { GameRoomDurableObject } from '$core/server/GameRoomDurableObject';

export {};
