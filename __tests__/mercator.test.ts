import { lonLatToTile, tileToLonLat } from '../src/geo/mercator';

test('lonLatToTile and tileToLonLat round trip', () => {
  const lon = 12.4924;
  const lat = 41.8902;
  const z = 6;

  const tile = lonLatToTile(lon, lat, z);
  const center = tileToLonLat(tile.x, tile.y, z);

  expect(tile.z).toBe(6);
  expect(center.lon).toBeGreaterThan(-180);
  expect(center.lon).toBeLessThan(180);
  expect(center.lat).toBeGreaterThan(-90);
  expect(center.lat).toBeLessThan(90);
});
