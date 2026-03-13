import { getConnection } from '../connection';
import { getSatelliteConstellation } from '../../simulation/satelliteConstellation';

async function seed() {
  const conn = await getConnection();
  const data = getSatelliteConstellation();

  console.log(`Seeding ${data.length} satellite records...`);

  const insertText = `INSERT INTO satellites (id, latitude, longitude, altitude, velocity, timestamp, geom)
    VALUES ($1,$2,$3,$4,$5,$6,ST_SetSRID(ST_MakePoint($3,$2),4326))
    ON CONFLICT (id) DO UPDATE SET
      latitude=EXCLUDED.latitude,
      longitude=EXCLUDED.longitude,
      altitude=EXCLUDED.altitude,
      velocity=EXCLUDED.velocity,
      timestamp=EXCLUDED.timestamp,
      geom=EXCLUDED.geom`;

  for (const sat of data) {
    const theta = ((sat.rightAscension + sat.meanAnomaly) % 360) * (Math.PI / 180);
    const phi = (sat.inclination % 180) * (Math.PI / 180);
    const radius = sat.semiMajorAxis;

    const longitude = ((theta * 180) / Math.PI) % 360;
    const latitude = ((phi * 180) / Math.PI) - 90;
    const altitude = radius - 6378.137;

    await conn.query(insertText, [sat.id, latitude, longitude, altitude, sat.meanMotion, sat.epoch]);
  }

  console.log('Seeding done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failure', err);
  process.exit(1);
});