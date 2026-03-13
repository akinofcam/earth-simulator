import * as satellite from 'satellite.js';
import { getConnection } from '../db/connection';
import { broadcast } from '../stream/wsPubsub';

const CELESTRAK_TLE_URL = 'https://celestrak.com/NORAD/elements/stations.txt';

function parseTLE(raw: string): Array<{ name: string; tle1: string; tle2: string }> {
  const lines = raw.trim().split(/\r?\n/);
  const result = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    result.push({ name: lines[i].trim(), tle1: lines[i + 1].trim(), tle2: lines[i + 2].trim() });
  }
  return result;
}

export async function ingestSatellites() {
  const resp = await fetch(CELESTRAK_TLE_URL);
  if (!resp.ok) {
    console.warn('CelesTrak fetch failed', resp.status);
    return;
  }

  const raw = await resp.text();
  const list = parseTLE(raw);
  const conn = await getConnection();

  const now = new Date();
  for (const sat of list) {
    try {
      const tle = satellite.twoline2satrec(sat.tle1, sat.tle2);
      const positionAndVelocity = satellite.propagate(tle, now);
      if (!positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') continue;
      const gmst = satellite.gstime(now);
      const eciPos = positionAndVelocity.position as satellite.EciVec3<number>;
      const geodetic = satellite.eciToGeodetic(eciPos, gmst);
      const longitude = (geodetic.longitude * 180) / Math.PI;
      const latitude = (geodetic.latitude * 180) / Math.PI;
      const altitude = geodetic.height * 1000;

      await conn.query(
        `INSERT INTO satellites(id, latitude, longitude, altitude, velocity, timestamp, geom)
         VALUES ($1,$2,$3,$4,$5,$6,ST_SetSRID(ST_MakePoint($3,$2),4326))
         ON CONFLICT (id) DO UPDATE SET latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude, altitude=EXCLUDED.altitude, velocity=EXCLUDED.velocity, timestamp=EXCLUDED.timestamp, geom=EXCLUDED.geom`,
        [sat.name, latitude, longitude, altitude, 0.0, now.toISOString()]
      );
      broadcast({
        type: 'satellite:update',
        id: sat.name,
        payload: { latitude, longitude, altitude },
      });
    } catch (err) {
      console.warn('satellite ingest failure', sat.name, err);
    }
  }
}
