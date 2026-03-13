import request from 'supertest';
import app from '../src/server/app';

describe('API routes', () => {
  test('/health returns ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('/simulation/rate default and set', async () => {
    const getRate = await request(app).get('/simulation/rate');
    expect(getRate.status).toBe(200);
    expect(getRate.body.rate).toBe(1);

    const postRate = await request(app).post('/simulation/rate').send({ rate: 10 });
    expect(postRate.status).toBe(200);
    expect(postRate.body.rate).toBe(10);

    const reset = await request(app).post('/simulation/rate').send({ rate: 1 });
    expect(reset.status).toBe(200);
    expect(reset.body.rate).toBe(1);
  });

  test('/tiles/pbf returns protobuf content type', async () => {
    const response = await request(app).get('/data/tiles/pbf/1/0/0');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/x-protobuf');
  });
});
