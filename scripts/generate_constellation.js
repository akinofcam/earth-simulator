const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/simulation/satelliteConstellation.ts');
const count = 10000;

const stream = fs.createWriteStream(filePath, { encoding: 'utf8' });
stream.write('// Auto-generated satellite constellation dataset.\n');
stream.write('// Each entry simulates an orbit object for initial sandbox simulation data.\n\n');
stream.write('export interface SatelliteOrbit {\n');
stream.write('  id: string;\n');
stream.write('  name: string;\n');
stream.write('  inclination: number;\n');
stream.write('  semiMajorAxis: number;\n');
stream.write('  eccentricity: number;\n');
stream.write('  rightAscension: number;\n');
stream.write('  argumentOfPerigee: number;\n');
stream.write('  meanAnomaly: number;\n');
stream.write('  meanMotion: number;\n');
stream.write('  epoch: string;\n');
stream.write('}\n\n');
stream.write('export const satelliteConstellation: SatelliteOrbit[] = [\n');

for (let i = 1; i <= count; i++) {
  const id = `SAT-${String(i).padStart(5, '0')}`;
  const base = (i % 90) + 5;
  const inclination = Number((base + (i % 20) * 0.033).toFixed(4));
  const semiMajorAxis = Number((6678 + (i % 200) * 0.8).toFixed(4));
  const eccentricity = Number(((i % 100) * 0.00001).toFixed(7));
  const rightAscension = Number(((i * 13.5) % 360).toFixed(4));
  const argumentOfPerigee = Number(((i * 7.25) % 360).toFixed(4));
  const meanAnomaly = Number(((i * 19.3) % 360).toFixed(4));
  const meanMotion = Number((15.0 + ((i % 120) * 0.002)).toFixed(6));
  const epoch = new Date(Date.now() - (i * 60000)).toISOString();

  stream.write('  {\n');
  stream.write(`    id: '${id}',\n`);
  stream.write(`    name: 'Constellation-${i}',\n`);
  stream.write(`    inclination: ${inclination},\n`);
  stream.write(`    semiMajorAxis: ${semiMajorAxis},\n`);
  stream.write(`    eccentricity: ${eccentricity},\n`);
  stream.write(`    rightAscension: ${rightAscension},\n`);
  stream.write(`    argumentOfPerigee: ${argumentOfPerigee},\n`);
  stream.write(`    meanAnomaly: ${meanAnomaly},\n`);
  stream.write(`    meanMotion: ${meanMotion},\n`);
  stream.write(`    epoch: '${epoch}'\n`);

  if (i === count) {
    stream.write('  }\n');
  } else {
    stream.write('  },\n');
  }
}

stream.write('];\n\n');
stream.write('export function getSatelliteConstellation() {\n');
stream.write('  return satelliteConstellation;\n');
stream.write('}\n');

stream.end(() => {
  console.log(`Wrote ${count} satellite rows to ${filePath}`);
});
