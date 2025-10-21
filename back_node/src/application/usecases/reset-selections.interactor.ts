import { type SelectionRepository } from '@/application/ports/selection.repository';
import { RequestLogLevelEnum, writeLogLine } from '@/infrastructure/http/middleware/request-logger.middleware';
import { InternalServerError } from '@/infrastructure/http/errors/http.errors';

export class ResetSelectionsInteractor {
  constructor(private readonly selectionRepo: SelectionRepository) {}

  execute(): { ok: true } {
    try {
      this.selectionRepo.clear();
      void writeLogLine({
        level: RequestLogLevelEnum.info,
        line: '[reset-selection] selection cleared',
      });

      return { ok: true };
    } catch (err: unknown) {
      void writeLogLine({
        level: RequestLogLevelEnum.error,
        line: '[reset-selection] failed to clear selection',
        error: err,
      });
      throw new InternalServerError('ResetSelection failed', { where: 'ResetSelectionInteractor.execute' });
    }
  }
}