#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Paths
const workerPath = path.join(projectRoot, '.svelte-kit/cloudflare/_worker.js');
const durableObjectPath = path.join(projectRoot, 'src/lib/server/GameRoomDurableObject.ts');

console.log('🔧 Injecting Durable Objects into worker...');

// Check if worker file exists
if (!fs.existsSync(workerPath)) {
  console.error('❌ Worker file not found:', workerPath);
  process.exit(1);
}

// Check if Durable Object file exists
if (!fs.existsSync(durableObjectPath)) {
  console.error('❌ Durable Object file not found:', durableObjectPath);
  process.exit(1);
}

// Read the worker file
let workerContent = fs.readFileSync(workerPath, 'utf8');

// Read and process the Durable Object file
let durableObjectContent = fs.readFileSync(durableObjectPath, 'utf8');

// Remove TypeScript types and imports that won't work in the worker
durableObjectContent = durableObjectContent
  .replace(/import type \{[^}]+\} from [^;]+;/g, '') // Remove type imports
  .replace(/import \{[^}]+\} from ['"][^'"]+['"];/g, '') // Remove other imports for now
  .replace(/: [A-Za-z<>|[\],\s]+(?=[;,=\)])/g, '') // Remove type annotations more carefully
  .replace(/\)\s*:\s*[A-Za-z<>|[\],\s]+(?=\s*\{)/g, ')') // Remove function return types
  .replace(/\?\s*:/g, ':') // Remove optional type annotations
  .replace(/export class/g, 'class') // Remove export from class
  .replace(/private /g, '') // Remove private modifiers
  .replace(/readonly /g, '') // Remove readonly modifiers
  .replace(/timestamp\.now\(\)/g, 'Date.now()') // Fix timestamp calls
  .replace(/Map<[^>]+>/g, 'Map') // Remove Map type parameters
  .replace(/: any/g, '') // Remove any type annotations
  .replace(/(\w+)= new Map\(\)/g, '$1 = new Map()') // Fix variable declarations
  .replace(/\s+as\s+any/g, ''); // Remove 'as any' type assertions

// Create the Durable Object export
const durableObjectExport = `
// Durable Object for multiplayer game rooms
${durableObjectContent}

// Export the Durable Object class
export { GameRoomDurableObject };
`;

// Append the Durable Object to the worker
const modifiedWorkerContent = workerContent + '\n' + durableObjectExport;

// Write the modified worker back
fs.writeFileSync(workerPath, modifiedWorkerContent);

console.log('✅ Successfully injected GameRoomDurableObject into worker');
console.log('📁 Modified file:', workerPath); 