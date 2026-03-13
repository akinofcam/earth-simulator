import { getConnection } from '../db/connection';
import { broadcast } from '../stream/wsPubsub';

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';

export async function ingestFlights() {
  const resp = await fetch(OPENSKY_URL);
  if (!resp.ok) {
    console.warn('OpenSky request failed', resp.status);
    return;
  }

  const data = await resp.json();
  if (!data.states || !Array.isArray(data.states)) return;
  const conn = await getConnection();

  const insertText = `INSERT INTO flights (icao24,callsign,latitude,longitude,altitude,heading,velocity,vertical_rate,geo_altitude,is_on_ground,timestamp,geom)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,ST_SetSRID(ST_MakePoint($4,$3),4326))
      ON CONFLICT (icao24) DO UPDATE SET callsign = EXCLUDED.callsign, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude, altitude=EXCLUDED.altitude, heading=EXCLUDED.heading, velocity=EXCLUDED.velocity, vertical_rate=EXCLUDED.vertical_rate, geo_altitude=EXCLUDED.geo_altitude, is_on_ground=EXCLUDED.is_on_ground, timestamp=EXCLUDED.timestamp, geom=EXCLUDED.geom`;

  const inserted = [];
  await Promise.all(
    data.states.map(async (state: any) => {
      try {
        await conn.query(insertText, [
          state[0],
          state[1] ? state[1].trim() : null,
          state[6],
          state[5],
          state[7],
          state[10],
          state[9],
          state[11],
          state[13],
          state[8],
          new Date(state[4] * 1000).toISOString(),
        ]);
        inserted.push({ icao24: state[0], callsign: state[1] });
      } catch (err) {
        console.warn('flight insert failed', state[0], err);
      }
    })
  );

  broadcast({ type: 'flight:update', timestamp: new Date().toISOString(), count: inserted.length });
}
