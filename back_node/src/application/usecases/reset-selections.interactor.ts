import { type SelectionRepository } from '@/application/ports/selection.repository';

export class ResetSelectionsInteractor {
  constructor(private readonly selectionRepo: SelectionRepository) {}

  execute(): { ok: true } {
    this.selectionRepo.clear();
    return { ok: true };
  }
}