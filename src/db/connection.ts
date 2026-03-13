import { Client } from 'pg';

const client = new Client({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'earth_simulator',
  password: process.env.PGPASSWORD || 'password',
  port: Number(process.env.PGPORT || 5432),
});

let connected = false;

export const getConnection = async (): Promise<Client> => {
  if (connected) {
    return client;
  }

  await client.connect();
  connected = true;

  // Ensure required tables exist
  await client.query(`
    CREATE EXTENSION IF NOT EXISTS postgis;

    CREATE TABLE IF NOT EXISTS satellites (
      id TEXT PRIMARY KEY,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      altitude DOUBLE PRECISION NOT NULL,
      velocity DOUBLE PRECISION NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
      geom GEOMETRY(POINT, 4326)
    );

    CREATE TABLE IF NOT EXISTS flights (
      icao24 TEXT PRIMARY KEY,
      callsign TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      altitude DOUBLE PRECISION,
      heading DOUBLE PRECISION,
      velocity DOUBLE PRECISION,
      vertical_rate DOUBLE PRECISION,
      geo_altitude DOUBLE PRECISION,
      is_on_ground BOOLEAN,
      timestamp TIMESTAMP WITH TIME ZONE,
      geom GEOMETRY(POINT, 4326)
    );

    CREATE TABLE IF NOT EXISTS weather (
      city TEXT PRIMARY KEY,
      temperature DOUBLE PRECISION,
      humidity DOUBLE PRECISION,
      pressure DOUBLE PRECISION,
      wind_speed DOUBLE PRECISION,
      timestamp TIMESTAMP WITH TIME ZONE,
      geom GEOMETRY(POINT, 4326)
    );

    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      severity INTEGER,
      properties JSONB,
      timestamp TIMESTAMP WITH TIME ZONE,
      geom GEOMETRY(POINT, 4326)
    );

    CREATE INDEX IF NOT EXISTS satellites_geo ON satellites USING GIST (geom);
    CREATE INDEX IF NOT EXISTS flights_geo ON flights USING GIST (geom);
    CREATE INDEX IF NOT EXISTS weather_geo ON weather USING GIST (geom);
    CREATE INDEX IF NOT EXISTS events_geo ON events USING GIST (geom);
  `);

  return client;
};
