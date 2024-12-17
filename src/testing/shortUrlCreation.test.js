const request = require('supertest');
const app = require('../app');  // Import the Express app

describe('POST /api/shorten', () => {
  it('should create a short URL with valid longUrl', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'https://example.com', customAlias: 'exmpl' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body).toHaveProperty('createdAt');
  });

  it('should return an error for invalid longUrl format', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'invalid-url' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid URL format');
  });

  it('should limit URL creation requests based on rate limiting', async () => {
    // Simulate multiple requests from the same user
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/shorten')
        .send({ longUrl: 'https://example.com', customAlias: 'exmpl' });
    }

    const res = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'https://example.com', customAlias: 'exmpl' });

    expect(res.statusCode).toEqual(429); // Too many requests
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Rate limit exceeded');
  });
});
