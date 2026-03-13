import { Router } from 'express';
import { getSatelliteConstellation } from '../../simulation/satelliteConstellation';

export const simulationRouter = Router();

let simulationRate = 1;

simulationRouter.get('/rate', (_req, res) => {
  res.json({ rate: simulationRate });
});

simulationRouter.post('/rate', (req, res) => {
  const { rate } = req.body;
  if (![1, 10, 100].includes(rate)) {
    return res.status(400).json({ error: 'rate must be one of 1, 10, 100' });
  }
  simulationRate = rate;
  res.json({ rate: simulationRate });
});

simulationRouter.get('/constellations', (_req, res) => {
  const data = getSatelliteConstellation();
  res.json({ count: data.length, data });
});
