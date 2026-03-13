export type SimulationSpeed = 1 | 10 | 100;

export class SimulationClock {
  private now = Date.now();
  private speed: SimulationSpeed = 1;
  private lastUpdate = Date.now();

  get currentTime(): number {
    return this.now;
  }

  get currentSpeed(): SimulationSpeed {
    return this.speed;
  }

  setSpeed(newSpeed: SimulationSpeed): void {
    this.speed = newSpeed;
  }

  tick(): void {
    const ms = Date.now() - this.lastUpdate;
    this.now += ms * this.speed;
    this.lastUpdate = Date.now();
  }

  setTime(iso: string): void {
    const ts = Date.parse(iso);
    if (!Number.isNaN(ts)) {
      this.now = ts;
      this.lastUpdate = Date.now();
    }
  }
}
