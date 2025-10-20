import { type NextFunction, type RequestHandler, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const HEADER_REQUEST_ID = process.env.HEADER_REQUEST_ID || 'x-request-id';
const HEADER_CORRELATION_ID = process.env.HEADER_CORRELATION_ID || 'x-correlation-id';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
  }
}

enum RequestLogLevelEnum {
  info = 'info',
  warn = 'warn',
  error = 'error',
}

function chooseLogLevel(status: number): RequestLogLevelEnum {
  if (status >= 500) return RequestLogLevelEnum.error;
  if (status >= 400) return RequestLogLevelEnum.warn;
  return RequestLogLevelEnum.info;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export async function writeLogLine(line: string, now: Date = new Date()): Promise<void> {
  const yyyy = String(now.getFullYear());
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());

  const dir = path.join(process.cwd(), 'logs', yyyy, mm);
  const filePath = path.join(dir, `${dd}.log`);

  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(filePath, line + '\n', { encoding: 'utf8' });
}

export const requestLogger: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  const incoming = (req.headers[HEADER_REQUEST_ID] as string) || (req.headers[HEADER_CORRELATION_ID] as string);
  const requestId = incoming || randomUUID();

  req.requestId = requestId;
  res.setHeader(HEADER_REQUEST_ID, requestId);
  res.setHeader(HEADER_CORRELATION_ID, requestId);

  const { method, originalUrl } = req;
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip;

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const status = res.statusCode;
    const level = chooseLogLevel(status);

    const logLine =
      `[${requestId}] ${method} ${originalUrl} ` +
      `${status} ${durationMs.toFixed(1)}ms ` +
      `(ip=${ip || '-'}, ua="${userAgent.replace(/"/g, "'")}")`;

    void writeLogLine(`${new Date().toISOString()} ${level.toUpperCase()} ${logLine}`).catch((err: unknown) => {
      console.error('Failed to write log line:', err);
    });
  });

  next();
};

export function getRequestId(req: Request) {
  return req.requestId;
}
