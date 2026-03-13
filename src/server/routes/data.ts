import { Router } from 'express';
import { getConnection } from '../../db/connection';
import { lonLatToTile, tileToLonLat } from '../../geo/mercator';

export const dataRouter = Router();

dataRouter.get('/tile/:z/:x/:y', async (req, res) => {
  const z = Number(req.params.z);
  const x = Number(req.params.x);
  const y = Number(req.params.y);
  if ([z, x, y].some((v) => Number.isNaN(v))) {
    return res.status(400).json({ error: 'invalid tile coordinate' });
  }

  const { lon, lat } = tileToLonLat(x, y, z);
  const conn = await getConnection();
  const result = await conn.query(
    'SELECT id, ST_X(geom::geometry) AS longitude, ST_Y(geom::geometry) AS latitude, altitude, velocity, timestamp FROM satellites WHERE geom && ST_MakeEnvelope($1,$2,$3,$4,4326)',
    [lon - 1, lat - 1, lon + 1, lat + 1]
  );

  res.json({ tile: { z, x, y }, center: { lon, lat }, features: result.rows });
});

dataRouter.get('/satellites', async (req, res) => {
  const limit = Number(req.query.limit || 500);
  const offset = Number(req.query.offset || 0);
  const conn = await getConnection();
  const result = await conn.query(
    'SELECT id, latitude, longitude, altitude, velocity, timestamp FROM satellites ORDER BY id LIMIT $1 OFFSET $2',
    [Math.min(5000, limit), Math.max(0, offset)]
  );

  res.json({ count: result.rowCount, data: result.rows });
});

dataRouter.get('/tiles/pbf/:z/:x/:y', async (req, res) => {
  const z = Number(req.params.z);
  const x = Number(req.params.x);
  const y = Number(req.params.y);
  if ([z, x, y].some((v) => Number.isNaN(v))) {
    return res.status(400).json({ error: 'invalid tile coordinate' });
  }

  // Placeholder vector tile generation for server-side route.
  // Real generation should produce protocol buffer data from features.
  const emptyTile = Buffer.from('');
  res.setHeader('Content-Type', 'application/x-protobuf');
  res.setHeader('Content-Encoding', 'identity');
  res.send(emptyTile);
});

dataRouter.get('/tile-coordinates', (req, res) => {
  const lon = Number(req.query.lon);
  const lat = Number(req.query.lat);
  const z = Number(req.query.z) || 2;

  if ([lon, lat].some((v) => Number.isNaN(v))) {
    return res.status(400).json({ error: 'lon/lat required' });
  }

  res.json(lonLatToTile(lon, lat, z));
});
