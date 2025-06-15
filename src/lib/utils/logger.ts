// Lightweight structured logger util – avoids external dependencies.
// Logs JSON strings so Cloudflare / any log aggregator can parse easily.

export type LogLevel = 'info' | 'error' | 'warn';

export interface LogEntry {
  level: LogLevel;
  timestamp: string; // ISO string
  message: string;
  correlationId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export function generateCorrelationId(): string {
  // crypto.randomUUID is available in modern runtimes including Cloudflare workers
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback to Math.random – uniqueness not critical for logs but better than nothing
  return `cid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function log(level: LogLevel, message: string, correlationId?: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    correlationId,
  };
  if (data !== undefined) {
    entry.data = data;
  }
  const str = JSON.stringify(entry);
  if (level === 'error') {
    console.error(str);
  } else if (level === 'warn') {
    console.warn(str);
  } else {
    console.log(str);
  }
} 