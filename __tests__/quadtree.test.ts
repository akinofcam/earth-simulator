import { QuadtreeNode, Point2D } from '../src/geo/quadtree';

test('Quadtree inserts and queries points', () => {
  const qt = new QuadtreeNode(0, 0, 100, 100);
  qt.insert({ x: 10, y: 10 });
  qt.insert({ x: 40, y: 40 });
  qt.insert({ x: 90, y: 90 });

  const found = qt.query({ x: 0, y: 0, width: 50, height: 50 });
  expect(found.length).toBeGreaterThanOrEqual(2);
});
