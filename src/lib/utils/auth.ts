/* Utility functions for signing and verifying authentication tokens
   ------------------------------------------------------------------
   We use a very small custom format to avoid an external JWT library.
   Token format:  <roomCode>.<playerId>.<signature>

   signature = base64url( HMAC_SHA256( `${roomCode}:${playerId}`, secret ) )
*/

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function generateToken(roomCode: string, playerId: string, secret: string): Promise<string> {
  const data = `${roomCode}:${playerId}`;
  const sig = await hmacSha256(secret, data);
  return `${roomCode}.${playerId}.${sig}`;
}

// Returns the roomCode if token is valid, otherwise null
export async function verifyToken(token: string, secret: string): Promise<{ roomCode: string; playerId: string } | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [roomCode, playerId, signature] = parts;
  const expectedSig = await hmacSha256(secret, `${roomCode}:${playerId}`);
  if (timingSafeEqual(signature, expectedSig)) {
    return { roomCode, playerId };
  }
  return null;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

async function hmacSha256(key: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(msg));
  return bufferToBase64Url(sigBuf);
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : ((globalThis as any).Buffer ? (globalThis as any).Buffer.from(binary, 'binary').toString('base64') : '');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
} 