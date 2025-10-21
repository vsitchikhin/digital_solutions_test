import { type Request, type Response } from 'express';
import { RequestLogLevelEnum, writeLogLine } from '@/infrastructure/http/middleware/request-logger.middleware';
import { InternalServerError } from '@/infrastructure/http/errors/http.errors';
import os from 'os';

export class HealthHandler {
  get = async(_req: Request, res: Response): Promise<void> => {
    try {
      const uptime = process.uptime();
      const memory = process.memoryUsage();
      const loadAvg = os.loadavg();

      const data = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(uptime),
        nodeVersion: process.version,
        memory: {
          rss: memory.rss,
          heapUsed: memory.heapUsed,
          heapTotal: memory.heapTotal,
        },
        loadAvg,
      };
      void writeLogLine({
        level: RequestLogLevelEnum.info,
        line: '[health] ok',
      });

      res.status(200).json(data);
    } catch (err: unknown) {
      void writeLogLine({
        level: RequestLogLevelEnum.error,
        line: '[health] failed to gather status',
        error: err,
      });
      throw new InternalServerError('Health check failed', { where: 'HealthHandler.get' });
    }
  };
}