import type { Request, Response } from 'express';
import type {
  GetEntitiesListRequest,
  GetSelectedEntitiesRequest,
} from '@/application/dto/entities.dto';
import type {
  QueueAddItemsRequest,
  QueueAddItemsEnqueueResponse,
  QueueMutationsRequest,
  QueueMutationsResponse,
} from '@/application/dto/mutations.dto';
import { type GetEntitiesListInteractor } from '@/application/usecases/get-entities-list.interactor';
import { type GetSelectedEntitiesInteractor } from '@/application/usecases/get-selected-entities.interactor';
import { type QueueAddItemsInteractor } from '@/application/usecases/queue-add-items.interactor';
import { type QueueMutationsInteractor } from '@/application/usecases/queue-mutations.interactor';
import {
  BadRequestError,
  InternalServerError,
} from '@/infrastructure/http/errors/http.errors';
import { type ResetSelectionsInteractor } from '@/application/usecases/reset-selections.interactor';

export class EntitiesHandler {
  private MAX_LIMIT = Number(process.env.MAX_ENTITIES_LIMIT) || 100;

  constructor(
    private readonly getListUC: GetEntitiesListInteractor,
    private readonly getSelectedUC: GetSelectedEntitiesInteractor,
    private readonly queueAddUC: QueueAddItemsInteractor,
    private readonly queueMutationsUC: QueueMutationsInteractor,
    private readonly resetUC: ResetSelectionsInteractor,
  ) {}

  getList(req: Request, res: Response): void {
    try {
      const dto: GetEntitiesListRequest = {
        cursor: this.parseOptionalNumber(req.query.cursor, 'cursor'),
        limit: this.parseOptionalNumber(req.query.limit, 'limit'),
        q: this.parseOptionalNumber(req.query.q, 'q'),
      };

      this.validatePaging(dto.limit, dto.cursor, { route: '/api/entities/list', query: req.query });

      const result = this.getListUC.execute(dto);
      res.json(result);
    } catch (err: unknown) {
      throw this.asInternalServerError(err, {
        route: '/api/entities/list',
        query: req.query,
      });
    }
  }

  getSelected(req: Request, res: Response): void {
    try {
      const dto: GetSelectedEntitiesRequest = {
        cursor: this.parseOptionalNumber(req.query.cursor, 'cursor'),
        limit: this.parseOptionalNumber(req.query.limit, 'limit'),
        q: this.parseOptionalNumber(req.query.q, 'q'),
      };

      this.validatePaging(dto.limit, dto.cursor, { route: '/api/entities/selected', query: req.query });

      const result = this.getSelectedUC.execute(dto);
      res.json(result);
    } catch (err: unknown) {
      throw this.asInternalServerError(err, {
        route: '/api/entities/selected',
        query: req.query,
      });
    }
  }

  queueCreate(req: Request, res: Response): void {
    try {
      const body = req.body as QueueAddItemsRequest;

      if (!body || !Array.isArray(body.ids)) {
        throw new BadRequestError('Body must have "ids: number[]"', { body: req.body });
      }
      if (body.ids.length === 0) {
        throw new BadRequestError('"ids" must not be empty', { body });
      }
      if (!body.ids.every((x) => Number.isInteger(x) && x > 0)) {
        throw new BadRequestError('"ids" must be an array of positive integers', { body });
      }

      const result: QueueAddItemsEnqueueResponse = this.queueAddUC.execute(body);
      res.json(result);
    } catch (err: unknown) {
      throw this.asInternalServerError(err, {
        route: '/api/entities/queue/create',
        body: req.body,
      });
    }
  }

  queueMutate(req: Request, res: Response): void {
    try {
      const body = req.body as QueueMutationsRequest;

      if (!body || (body.select == null && body.unselect == null && body.reorder == null)) {
        throw new BadRequestError('Body must contain at least one of: select, unselect, reorder', { body });
      }

      if (body.select) {
        if (!Array.isArray(body.select) || body.select.length === 0)
          throw new BadRequestError('"select" must be a non-empty array of positive integers', { body });
        if (!body.select.every((x) => Number.isInteger(x) && x > 0))
          throw new BadRequestError('"select" must contain only positive integers', { body });
      }

      if (body.unselect) {
        if (!Array.isArray(body.unselect) || body.unselect.length === 0)
          throw new BadRequestError('"unselect" must be a non-empty array of positive integers', { body });
        if (!body.unselect.every((x) => Number.isInteger(x) && x > 0))
          throw new BadRequestError('"unselect" must contain only positive integers', { body });
      }

      if (body.reorder) {
        const { movedId, beforeId, afterId } = body.reorder;
        const anchors = [beforeId, afterId].filter((v) => typeof v === 'number') as number[];

        if (!Number.isInteger(movedId) || movedId <= 0)
          throw new BadRequestError('"reorder.movedId" must be a positive integer', { body });

        if (anchors.length !== 1)
          throw new BadRequestError(
            'Provide exactly one anchor: either "reorder.beforeId" or "reorder.afterId"',
            { body },
          );

        if (!Number.isInteger(anchors[0]) || anchors[0] <= 0)
          throw new BadRequestError('"reorder anchor" must be a positive integer', { body });
      }

      const result: QueueMutationsResponse = this.queueMutationsUC.execute(body);
      res.json(result);
    } catch (err: unknown) {
      throw this.asInternalServerError(err, {
        route: '/api/entities/queue/mutate',
        body: req.body,
      });
    }
  }

  reset(_req: Request, res: Response): void {
    try {
      const result = this.resetUC.execute();
      res.json(result);
    } catch(err: unknown) {
      throw new InternalServerError('Reset failed', {
        route: '/api/entities/reset',
        error: err instanceof Error ? { name: err.name, message: err.message } : String(err),
      });
    }
  }

  private parseOptionalNumber(value: unknown, fieldName: string): number | undefined {
    if (value == null || value === '') return undefined;

    if (typeof value === 'string') {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        throw new BadRequestError(`Query "${fieldName}" must be a number`, { value });
      }
      return parsed;
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new BadRequestError(`Query "${fieldName}" must be finite`, { value });
      }
      return value;
    }

    throw new BadRequestError(`Query "${fieldName}" must be a number`, { value });
  }

  private validatePaging(limit?: number, cursor?: number, context?: unknown): void {
    if (typeof limit !== 'undefined') {
      if (!Number.isInteger(limit) || limit <= 0 || limit > this.MAX_LIMIT) {
        throw new BadRequestError(`"limit" must be an integer in range [1..${this.MAX_LIMIT}]`, { limit, ...context as object });
      }
    }
    if (typeof cursor !== 'undefined') {
      if (!Number.isInteger(cursor) || cursor < 0) {
        throw new BadRequestError('"cursor" must be a non-negative integer', { cursor, ...context as object });
      }
    }
  }

  private asInternalServerError(err: unknown, details?: unknown): InternalServerError {
    if (err instanceof BadRequestError || err instanceof InternalServerError) return err;
    const message = err instanceof Error ? err.message : String(err);
    return new InternalServerError(message, details ?? { raw: err });
  }
}
