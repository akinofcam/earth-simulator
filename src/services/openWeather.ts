import { getConnection } from '../db/connection';
import { broadcast } from '../stream/wsPubsub';

export async function ingestWeather() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY not set, weather ingestion skipped');
    return;
  }

  const cities = [ 'London,uk', 'New York,us', 'Tokyo,jp', 'Sydney,au' ];
  for (const city of cities) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn('openweathermap call failed', city, resp.status);
      continue;
    }

    const data = await resp.json();
    const conn = await getConnection();

    const results = await conn.query(
      `INSERT INTO weather (city, temperature, humidity, pressure, wind_speed, timestamp, geom)
       VALUES ($1,$2,$3,$4,$5,$6,ST_SetSRID(ST_MakePoint($7,$8),4326))
       ON CONFLICT (city) DO UPDATE SET temperature=EXCLUDED.temperature, humidity=EXCLUDED.humidity, pressure=EXCLUDED.pressure, wind_speed=EXCLUDED.wind_speed, timestamp=EXCLUDED.timestamp, geom=EXCLUDED.geom`,
      [
        data.name,
        Number(data.main.temp),
        Number(data.main.humidity),
        Number(data.main.pressure),
        Number(data.wind.speed),
        new Date(data.dt * 1000).toISOString(),
        Number(data.coord.lon),
        Number(data.coord.lat),
      ]
    );

    broadcast({ type: 'weather:update', city: data.name, payload: data });
  }
}
