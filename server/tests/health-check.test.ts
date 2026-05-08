import request from 'supertest';
import app from '../src/index';

describe('Server Health Check Endpoint', () => {
  describe('GET /health', () => {
    it('should return 200 OK with status and message', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(response.body.status).toBe('ok');
      expect(response.body.message).toBe('Server is running');
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should have consistent response structure', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toMatchObject({
        status: expect.any(String),
        message: expect.any(String),
      });
    });
  });
});
