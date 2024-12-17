const request = require('supertest');
const app = require('../app');  // Import the Express app

describe('GET /api/shorten/:alias', () => {
  it('should redirect to the original URL for a valid alias', async () => {
    // Assuming a short URL is already created and available
    const shortUrl = 'http://localhost:3000/api/shorten/exmpl';

    const res = await request(app).get('/api/shorten/exmpl');

    expect(res.statusCode).toEqual(302);
    expect(res.header.location).toBe('https://example.com');  // The original URL
  });

  it('should return a 404 for an invalid alias', async () => {
    const res = await request(app).get('/api/shorten/invalid-alias');

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Short URL alias not found');
  });

  it('should return a 404 for an expired short URL', async () => {
    // Simulate an expired short URL
    const expiredShortUrl = 'http://localhost:3000/api/shorten/expired';
    // Logic to mark this URL as expired in your database would be here

    const res = await request(app).get('/api/shorten/expired');

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Short URL has expired');
  });

  it('should log the redirect event details', async () => {
    const alias = 'exmpl';
    const res = await request(app).get(`/api/shorten/${alias}`);

    expect(res.statusCode).toEqual(302);
    expect(res.header.location).toBe('https://example.com');

    // After redirecting, check the analytics logs
    // This would typically be done in a separate database query or mocked function
    const analyticsLog = await getRedirectAnalytics(alias); // Replace with actual function to get log

    expect(analyticsLog).toHaveProperty('timestamp');
    expect(analyticsLog).toHaveProperty('userAgent');
    expect(analyticsLog).toHaveProperty('ipAddress');
    expect(analyticsLog).toHaveProperty('geolocation');
  });
});
