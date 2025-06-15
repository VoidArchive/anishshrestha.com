import { build } from 'esbuild';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/**
 * Append compiled GameRoomDurableObject to the generated Cloudflare worker so
 * that Wrangler can detect and bind the Durable Object class at publish time.
 */
async function main() {
  const workerFile = resolve('.svelte-kit/cloudflare/_worker.js');
  const entryFile = resolve('src/core/server/GameRoomDurableObject.ts');

  // Bundle the Durable Object (and its dependencies) into a single ESM chunk
  const { outputFiles } = await build({
    entryPoints: [entryFile],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    treeShaking: true,
    write: false,
  });

  if (outputFiles.length === 0) {
    throw new Error('Failed to bundle GameRoomDurableObject');
  }

  const bundledCode = outputFiles[0].text;

  // Append the bundled code and re-export to the worker
  appendFileSync(workerFile, `\n// ---- Durable Object Bundle ----\n${bundledCode}\n// Re-export for Wrangler binding\nexport { GameRoomDurableObject };\n`);

  console.log('✅ Injected GameRoomDurableObject into worker bundle');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 