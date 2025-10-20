import { type Request, type ErrorRequestHandler  } from 'express';
import { HttpError, InternalServerError } from '@/infrastructure/http/errors/http.errors';
import {
  getRequestId,
  RequestLogLevelEnum,
  writeLogLine,
} from '@/infrastructure/http/middleware/request-logger.middleware';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const httpError = toHttpError(err);

  const status = (httpError as { status?: number }).status ?? 500;
  const level = status >= 500 ? RequestLogLevelEnum.error : RequestLogLevelEnum.warn;
  const requestId = getRequestId(req);

  void logHttpError(httpError, req, level, requestId);

  res.status(status).json({
    error: httpError.message,
    details: (httpError as { details?: unknown }).details,
    requestId,
  });
};

function toHttpError(err: unknown) {
  if (err instanceof HttpError) return err;

  const message = err instanceof Error ? err.message : 'Internal Server Error';

  const details = err instanceof Error
    ? { name: err.name, stack: err.stack }
    : { raw: String(err) };

  return new InternalServerError(message, details);
}

async function logHttpError(
  err: HttpError,
  req: Request,
  level: RequestLogLevelEnum,
  requestId: string | undefined,
): Promise<void> {
  const status = (err as { status?: number }).status ?? 500;
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip ?? '-';
  const userAgent = req.get('user-agent') ?? '';

  let line =
    `[${requestId ?? '-'}] ${method} ${url} -> ${status} ` +
    `message="${err.message.replace(/"/g, "'")}" ` +
    `(ip=${ip}, ua="${userAgent.replace(/"/g, "'")}")`;

  const details = (err as { details?: unknown }).details;
  if (typeof details !== 'undefined') {
    try {
      line += ` details=${JSON.stringify(details)}`;
    } catch {
      line += ' details="[unserializable]"';
    }
  }

  await writeLogLine({ line, level, error: err });
}