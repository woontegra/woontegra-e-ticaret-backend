import { env } from '../config/index.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  const configured = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel;
  const threshold = LEVEL_ORDER[configured] ?? LEVEL_ORDER.info;
  return LEVEL_ORDER[level] >= threshold;
}

function formatPayload(level: LogLevel, message: string, meta?: unknown): string {
  const entry = {
    ts: new Date().toISOString(),
    level,
    service: 'woontegra-api',
    env: env.NODE_ENV,
    message,
    ...(meta !== undefined ? { meta } : {}),
  };
  return JSON.stringify(entry);
}

export const logger = {
  debug(message: string, meta?: unknown) {
    if (shouldLog('debug')) console.debug(formatPayload('debug', message, meta));
  },
  info(message: string, meta?: unknown) {
    if (shouldLog('info')) console.info(formatPayload('info', message, meta));
  },
  warn(message: string, meta?: unknown) {
    if (shouldLog('warn')) console.warn(formatPayload('warn', message, meta));
  },
  error(message: string, meta?: unknown) {
    if (shouldLog('error')) console.error(formatPayload('error', message, meta));
  },
};
