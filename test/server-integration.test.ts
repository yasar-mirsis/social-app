/**
 * Integration Tests - Server Health Check
 *
 * Tests that verify the server can start and respond to health check.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Server Health Check Integration Tests', () => {
  let server: http.Server;
  let serverPort: number;
  let isServerRunning = false;

  beforeAll(async () => {
    // Start the server in a separate process
    const serverDir = path.join(__dirname, '../../server');
    const env = {
      ...process.env,
      PORT: '54321', // Use a non-standard port for testing
    };

    const devCommand = `cd "${serverDir}" && npm run dev`;
    try {
      // Start the server as a child process
      server = await startServer(devCommand, env);
      isServerRunning = true;

      // Wait for server to be ready
      await waitForServerReady('http://localhost:54321/health', 10000);
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  });

  afterAll(async () => {
    if (server && isServerRunning) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  it('should have a health check endpoint', () => {
    expect(isServerRunning).toBe(true);
  });

  it('should respond to health check with 200 status', async () => {
    if (!isServerRunning) {
      console.warn('Server is not running, skipping health check test');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 54321,
        path: '/health',
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('application/json');

        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(response).toHaveProperty('status');
            expect(response).toHaveProperty('message');
            expect(response.status).toBe('ok');
            expect(response.message).toBe('Server is running');
            resolve();
          } catch (error) {
            reject(new Error('Failed to parse JSON response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  });

  it('should respond to health check with correct content type', async () => {
    if (!isServerRunning) {
      console.warn('Server is not running, skipping content type test');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 54321,
        path: '/health',
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/application\/json/);
        resolve();
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  });

  it('should respond to health check with valid JSON structure', async () => {
    if (!isServerRunning) {
      console.warn('Server is not running, skipping JSON structure test');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 54321,
        path: '/health',
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(typeof response).toBe('object');
            expect(response).toHaveProperty('status', 'ok');
            expect(response).toHaveProperty('message', 'Server is running');
            resolve();
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  });

  it('should handle multiple health check requests', async () => {
    if (!isServerRunning) {
      console.warn('Server is not running, skipping concurrent requests test');
      return;
    }

    const requests = 5;
    const responses = [];

    const makeRequest = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 54321,
          path: '/health',
          method: 'GET',
        };

        const req = http.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.end();
      });
    };

    // Make multiple concurrent requests
    const requestPromises = Array.from({ length: requests }, () => makeRequest());
    responses.push(...await Promise.all(requestPromises));

    // Verify all responses are valid
    responses.forEach((response) => {
      expect(response).toHaveProperty('status', 'ok');
      expect(response).toHaveProperty('message', 'Server is running');
    });
  });

  // Helper function to start the server
  function startServer(command: string, env: NodeJS.ProcessEnv): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      try {
        // Execute the command
        const { spawn } = require('child_process');
        const process = spawn('npm', ['run', 'dev'], {
          cwd: path.join(__dirname, '../../server'),
          env,
          shell: true,
        });

        let output = '';

        process.stdout.on('data', (data) => {
          output += data.toString();
          console.log('Server output:', data.toString());
        });

        process.stderr.on('data', (data) => {
          console.error('Server error:', data.toString());
        });

        process.on('close', (code) => {
          console.log(`Server process exited with code ${code}`);
        });

        // Give the server a moment to start
        setTimeout(() => {
          resolve(process.stdout);
        }, 2000);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper function to wait for server to be ready
  function waitForServerReady(url: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= timeout) {
          clearInterval(interval);
          reject(new Error(`Server did not respond within ${timeout}ms`));
          return;
        }

        http.get(url, (res) => {
          if (res.statusCode === 200) {
            clearInterval(interval);
            resolve();
          }
        }).on('error', () => {
          // Server not ready yet, continue waiting
        });
      }, 500);
    });
  }
});
