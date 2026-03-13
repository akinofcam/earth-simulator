import express from 'express';
import { Router } from 'express';
import { healthRouter } from './routes/health';
import { simulationRouter } from './routes/simulation';
import { dataRouter } from './routes/data';

const app = express();
app.use(express.json());
app.use('/health', healthRouter);
app.use('/simulation', simulationRouter);
app.use('/data', dataRouter);

export default app;
