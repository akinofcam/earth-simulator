export interface Point2D {
  x: number;
  y: number;
  data?: any;
}

export class QuadtreeNode {
  bounds: { x: number; y: number; width: number; height: number };
  points: Point2D[] = [];
  divided = false;
  nw?: QuadtreeNode;
  ne?: QuadtreeNode;
  sw?: QuadtreeNode;
  se?: QuadtreeNode;

  static CAPACITY = 8;

  constructor(x: number, y: number, width: number, height: number) {
    this.bounds = { x, y, width, height };
  }

  insert(point: Point2D): boolean {
    if (!this.contains(point)) return false;

    if (this.points.length < QuadtreeNode.CAPACITY) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.nw!.insert(point) ||
      this.ne!.insert(point) ||
      this.sw!.insert(point) ||
      this.se!.insert(point)
    );
  }

  contains(point: Point2D): boolean {
    const { x, y, width, height } = this.bounds;
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  }

  subdivide() {
    const { x, y, width, height } = this.bounds;
    const halfW = width / 2;
    const halfH = height / 2;
    this.nw = new QuadtreeNode(x, y, halfW, halfH);
    this.ne = new QuadtreeNode(x + halfW, y, halfW, halfH);
    this.sw = new QuadtreeNode(x, y + halfH, halfW, halfH);
    this.se = new QuadtreeNode(x + halfW, y + halfH, halfW, halfH);
    this.divided = true;
  }

  query(range: { x: number; y: number; width: number; height: number }, found: Point2D[] = []): Point2D[] {
    if (!this.intersects(range)) {
      return found;
    }

    for (const p of this.points) {
      if (
        p.x >= range.x &&
        p.x <= range.x + range.width &&
        p.y >= range.y &&
        p.y <= range.y + range.height
      ) {
        found.push(p);
      }
    }

    if (this.divided) {
      this.nw!.query(range, found);
      this.ne!.query(range, found);
      this.sw!.query(range, found);
      this.se!.query(range, found);
    }

    return found;
  }

  intersects(range: { x: number; y: number; width: number; height: number }) {
    const a = this.bounds;
    const b = range;
    return !(b.x > a.x + a.width || b.x + b.width < a.x || b.y > a.y + a.height || b.y + b.height < a.y);
  }
}
