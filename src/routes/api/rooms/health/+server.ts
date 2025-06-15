import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ platform }: { platform: any }) => {
  try {
    const db = platform?.env?.DB;
    if (!db) {
      return json({ status: 'error', message: 'DB binding missing' }, { status: 500 });
    }

    const res = await db.prepare('SELECT 1 as ok').first();
    return json({ status: 'ok', db: res?.ok === 1 }, { status: 200 });
  } catch (err) {
    console.error('Health check failed', err);
    return json({ status: 'error' }, { status: 500 });
  }
}; 