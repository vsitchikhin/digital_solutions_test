import express, { type Express, json } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import useEntitiesRouter from '@/infrastructure/http/routes/entities.routes';
import { errorHandler } from '@/infrastructure/http/middleware/error-handler.middleware';
import { requestLogger } from '@/infrastructure/http/middleware/request-logger.middleware';

dotenv.config();

export const app: Express = express();

app.use(cors());
app.use(json());

app.use(requestLogger);

app.use('/api/entities', useEntitiesRouter());
app.use(errorHandler);