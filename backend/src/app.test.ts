import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import createApp from './app';

afterEach(() => {
  delete process.env.ALLOWED_ORIGINS;
});

test('CORS allows the built-in default origins when ALLOWED_ORIGINS is not set', async () => {
  const app = createApp();
  const res = await request(app).get('/health').set('Origin', 'http://localhost:5173');
  assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
});

test('CORS respects ALLOWED_ORIGINS when set, as a comma-separated list', async () => {
  process.env.ALLOWED_ORIGINS = 'https://example.com, https://foo.bar';
  const app = createApp();

  const allowed = await request(app).get('/health').set('Origin', 'https://foo.bar');
  assert.equal(allowed.headers['access-control-allow-origin'], 'https://foo.bar');

  const disallowed = await request(app).get('/health').set('Origin', 'https://mrlhfz.github.io');
  assert.equal(disallowed.headers['access-control-allow-origin'], undefined);
});
