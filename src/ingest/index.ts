import { SimulationClock } from '../simulation/timeEngine';
import { ingestFlights } from '../services/openSky';
import { ingestSatellites } from '../services/celestrak';
import { ingestWeather } from '../services/openWeather';
import { ingestEarthquakes } from '../services/usgs';

const clock = new SimulationClock();

export const getSimClock = () => clock;

export async function startIngestionLoop() {
  console.log('Starting ingestion scheduler');

  setInterval(async () => {
    clock.tick();
    try {
      await Promise.all([
        ingestSatellites(),
        ingestFlights(),
        ingestWeather(),
        ingestEarthquakes(),
      ]);
    } catch (err) {
      console.error('Ingestion loop error', err);
    }
  }, 5_000);
}
