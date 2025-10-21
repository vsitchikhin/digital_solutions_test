import { type Scheduler } from '@/application/ports/scheduler';
import { RequestLogLevelEnum, writeLogLine } from '@/infrastructure/http/middleware/request-logger.middleware';

type IntervalHandler = ReturnType<typeof setInterval>

export class IntervalScheduler implements Scheduler {
  every(ms: number, task: () => void): { stop(): void } {
    const handle: IntervalHandler = setInterval(() => {
      try {
        task();
      } catch(err: unknown) {
        void writeLogLine({
          level: RequestLogLevelEnum.error,
          line: '[scheduler] task failed',
          error: err,
        });
      }
    }, ms);

    return {
      stop(): void {
        clearInterval(handle);
        void writeLogLine({
          level: RequestLogLevelEnum.info,
          line: '[scheduler] stopped',
        });
      },
    };
  }
}