import { type Request, type Response } from 'express';

export class EntitiesHandler {
  async getList(req: Request, res: Response) {res.status(501).send('Not implemented');}

  async getSelected(req: Request, res: Response) {res.status(501).send('Not implemented');}

  async queueCreate(req: Request, res: Response) {res.status(501).send('Not implemented');}

  async queueMutate(req: Request, res: Response) {res.status(501).send('Not implemented');}

  async reset(req: Request, res: Response) {res.status(501).send('Not implemented');}
}