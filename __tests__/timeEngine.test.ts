import { SimulationClock } from '../src/simulation/timeEngine';

test('SimulationClock advances at 1x', () => {
  const clock = new SimulationClock();
  const before = clock.currentTime;
  clock.tick();
  const after = clock.currentTime;
  expect(after).toBeGreaterThanOrEqual(before);
});

test('SimulationClock set speed 100x', () => {
  const clock = new SimulationClock();
  clock.setSpeed(100);
  expect(clock.currentSpeed).toBe(100);
});
