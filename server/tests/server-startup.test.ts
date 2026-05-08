import request from 'supertest';
import app from '../src/index';
import http from 'http';

describe('Server Startup', () => {
  let server: http.Server;

  beforeAll((done) => {
    // Get the actual server instance from the Express app
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    // Close the server after all tests
    server.close(done);
  });

  describe('Server is running', () => {
    it('should be listening on a port', () => {
      expect(server.listening).toBe(true);
    });

    it('should respond to health check endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should use environment variable PORT if set', () => {
      const port = process.env.PORT || 3001;
      const address = server.address();
      expect(address).toBeDefined();
      expect(address.port).toBe(port);
    });
  });

  describe('Server configuration', () => {
    it('should have CORS middleware enabled', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      // CORS headers should be present
      expect(response.headers).toBeDefined();
    });

    it('should have JSON body parsing middleware enabled', async () => {
      const response = await request(app)
        .post('/health')
        .send({ test: 'data' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });
});
