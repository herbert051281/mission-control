import http from 'http';
import { app } from '../index';

// Mock the database connection
jest.mock('../db/connection', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
  query: jest.fn(),
  closePool: jest.fn(),
}));

describe('Server', () => {
  jest.setTimeout(15000);

  it('should start and listen on port 3000', (done) => {
    const port = 3005; // Use different port to avoid conflicts
    const server = app.listen(port, () => {
      // Server is now listening
      const request = http.get(`http://localhost:${port}/api/health`, (res) => {
        expect(res.statusCode).toBeGreaterThanOrEqual(200);
        expect(res.statusCode).toBeLessThan(600);
        request.destroy();
        server.close(() => {
          done();
        });
      });

      request.on('error', (err) => {
        server.close();
        done(err);
      });
    });

    server.on('error', (err) => {
      done(err);
    });
  });
});
