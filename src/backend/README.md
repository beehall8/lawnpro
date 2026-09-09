# Lawn Pro Backend API

Node.js + Express backend for the Lawn Pro marketplace platform.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Properties
- `POST /api/v1/properties` - Create property
- `GET /api/v1/properties` - List properties
- `GET /api/v1/properties/:id` - Get property details

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/:id` - Get order details

### Vendors
- `GET /api/v1/vendors/jobs` - Get available jobs
- `POST /api/v1/vendors/jobs/:id/accept` - Accept job
- `POST /api/v1/vendors/jobs/:id/decline` - Decline job
- `GET /api/v1/vendors/earnings` - Get earnings summary

## Testing

Test with curl:

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe","role":"customer"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Health check
curl http://localhost:5000/health
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Update JWT secrets in `.env`
3. Configure PostgreSQL database
4. Set up SSL/HTTPS
5. Deploy to AWS/GCP/Heroku

See main README.md for full deployment instructions.
