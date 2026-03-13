import { getConnection } from '../db/connection';
import { broadcast } from '../stream/wsPubsub';

const USGS_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson';

export async function ingestEarthquakes() {
  const res = await fetch(USGS_API);
  if (!res.ok) {
    console.warn('USGS fetch failed', res.status);
    return;
  }

  const data = await res.json();
  if (!data.features || !Array.isArray(data.features)) return;

  const conn = await getConnection();

  for (const feature of data.features) {
    const [lon, lat, depth] = feature.geometry.coordinates;
    const properties = feature.properties || {};

    await conn.query(
      `INSERT INTO events(type, latitude, longitude, severity, properties, timestamp, geom)
       VALUES ($1,$2,$3,$4,$5,$6,ST_SetSRID(ST_MakePoint($3,$2),4326))`,
      [
        'earthquake',
        lat,
        lon,
        Math.max(0, Number(properties.mag || 0)),
        JSON.stringify(properties),
        new Date(properties.time).toISOString(),
      ]
    );

    broadcast({ type: 'event:earthquake', payload: { lat, lon, mag: properties.mag, place: properties.place } });
  }
}
