import express, { type Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { useEntitiesRouter } from '@/infrastructure/http/routes/entities.routes';
import { errorMiddleware } from '@/infrastructure/http/middleware/error.middleware';

dotenv.config();

export const app: Express = express();

app.use(cors());

app.use('/entities', useEntitiesRouter);
app.use(errorMiddleware);