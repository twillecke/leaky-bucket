# Leaky Bucket API

This project implements a **Leaky Bucket** rate limiter strategy inspired by BACEN's Pix API. It includes:

- Node.js HTTP server using Koa and TypeScript
- Multi-tenancy support with user-based token buckets
- Authentication via Bearer Token (JWT)
- A Pix key query mutation simulation
- Rate limiting with leaky bucket algorithm (tokens refill hourly)
- Observability with Prometheus metrics and Grafana dashboards
- Testing with Jest including multi-tenant request simulation

---

## Features

- Each user starts with a bucket of 10 tokens.
- Each request consumes 1 token on failure.
- Successful requests do not consume tokens.
- Tokens refill at a rate of 1 per hour up to the max bucket size (10).
- JWT-based authentication.
- API exposes `/metrics` endpoint for Prometheus scraping.
- Docker compose files included for running Prometheus and Grafana.

---

## Setup

1. Clone the repo

```bash
git clone <repo-url>
cd leaky-bucket-api
```
2. Install dependencies
```
npm install
```
3. Create a `.env` file in the root directory with the following structure:
```
PORT=3000
JWT_SECRET=your_jwt_secret
BUCKET_CAPACITY=10
BUCKET_REFILL_RATE=3600000  # 1 hour in ms
```
4. Start the server (DEVELOPMENT MODE)
```
npm run dev
```
5. For production, build the project and run it
```
npm run build
npm start
```
5. Access the API at `http://localhost:3000`
6. Start Prometheus and Grafana
```
docker-compose up -d
```
7. Access Prometheus at `http://localhost:9090` and Grafana at `http://localhost:3001
8. Testing
```
npm run test
```
## API
POST /pix
- **Description**: Simulates a Pix key query mutation.
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
Body:
```json
{
  "pidId": "your_pix_key"
}
```
Responses:
- 200 OK with tokens left and success/failure message
- 429 Too Many Requests if rate limited
- 401 Unauthorized if missing or invalid token
- Include `X-RateLimit-Remaining` header in responses to indicate remaining tokens
- Include `X-RateLimit-Reset` header to indicate when tokens will be refilled