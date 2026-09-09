# Lawn Pro - Technical Architecture

## System Overview

Lawn Pro is a two-sided marketplace built with a modern, scalable architecture designed for rapid iteration and growth.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├──────────────────────┬──────────────────────────────────────┤
│   Customer Web App   │     Vendor Web App (Responsive)      │
│   (React.js)         │     (React.js - Same Codebase)       │
└──────────┬───────────┴────────────────┬─────────────────────┘
           │                            │
           │         HTTPS/REST         │
           │                            │
┌──────────▼────────────────────────────▼─────────────────────┐
│                     API Gateway (Express.js)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication Middleware (JWT + Refresh Tokens)    │   │
│  │  Rate Limiting (Redis-backed)                        │   │
│  │  Request Validation (Zod/Joi)                        │   │
│  │  CORS Policy                                         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  Auth Service  │  │  Core Service  │  │ Satellite SVc  │
│                │  │                │  │                │
│ - Register     │  │ - Properties   │  │ - Geocoding    │
│ - Login        │  │ - Orders       │  │ - Estimation   │
│ - Password Rst │  │ - Vendors      │  │ - CV Analysis  │
│ - JWT Mgmt     │  │ - Reviews      │  │ - Caching      │
└────────────────┘  └────────────────┘  └────────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────┐ ┌──────▼─────┐ ┌──────▼──────┐
     │ PostgreSQL  │ │   Redis    │ │  Google     │
     │ (Primary DB)│ │  (Cache)   │ │  Maps API   │
     └─────────────┘ └────────────┘ └─────────────┘
```

## Technology Stack

### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React.js | 18.x | UI component library |
| Language | TypeScript | 5.x | Type safety |
| State Mgmt | Zustand | 4.x | Lightweight state management |
| Routing | React Router | 6.x | Client-side routing |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Forms | React Hook Form | 7.x | Form handling |
| Validation | Zod | 3.x | Schema validation |
| HTTP Client | Axios | 1.x | API communication |
| Maps | Google Maps JS API | Latest | Interactive maps |
| Testing | Jest + RTL | Latest | Unit/integration tests |

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 18.x LTS | JavaScript runtime |
| Framework | Express.js | 4.x | Web framework |
| Language | TypeScript | 5.x | Type safety |
| Auth | JWT + bcrypt | Latest | Authentication |
| Validation | Zod | 3.x | Request validation |
| API Docs | Swagger/OpenAPI | Latest | API documentation |
| Testing | Jest + Supertest | Latest | API testing |

### Database
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Primary DB | PostgreSQL | 14.x | Relational data storage |
| Cache | Redis | 7.x | Session/cache/rate limiting |
| ORM | Prisma | 5.x | Type-safe database access |
| Migrations | Prisma Migrate | 5.x | Schema migrations |

### Third-Party Services
| Service | Purpose | Cost Estimate |
|---------|---------|--------------|
| Google Maps Platform | Geocoding, Static Maps, Geometry APIs | $50-100/mo |
| Stripe | Payment processing | 2.9% + $0.30/txn |
| SendGrid | Email notifications | $15-50/mo |
| Twilio | SMS notifications | $0.0075/msg |
| AWS S3 | Image/file storage | $10-30/mo |
| CloudFlare | CDN + DDoS protection | Free-$20/mo |

### Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Hosting | AWS EC2 / GCP Compute | Application servers |
| Database | AWS RDS / GCP Cloud SQL | Managed PostgreSQL |
| Cache | AWS ElastiCache / GCP Memorystore | Managed Redis |
| Storage | AWS S3 / GCP Cloud Storage | File uploads |
| CDN | CloudFlare | Static asset delivery |
| CI/CD | GitHub Actions | Automated deployments |
| Monitoring | DataDog / New Relic | Performance monitoring |
| Logging | ELK Stack | Log aggregation |

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'vendor', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### properties
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(50) DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  estimated_lawn_sqft INTEGER,
  verified_lawn_sqft INTEGER,
  satellite_image_url TEXT,
  lawn_estimate_confidence DECIMAL(5, 2),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_properties_user ON properties(user_id);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
CREATE INDEX idx_properties_zip ON properties(zip_code);
```

#### vendors
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  ein VARCHAR(20),
  insurance_provider VARCHAR(255),
  insurance_policy_number VARCHAR(100),
  insurance_expiry_date DATE,
  license_number VARCHAR(100),
  service_radius_miles INTEGER DEFAULT 25,
  avg_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_jobs_completed INTEGER DEFAULT 0,
  total_earnings_cents INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  background_check_status VARCHAR(50) DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_verified ON vendors(verified);
CREATE INDEX idx_vendors_rating ON vendors(avg_rating DESC);
```

#### vendor_services
```sql
CREATE TABLE vendor_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  base_price_cents INTEGER NOT NULL,
  price_per_sqft_cents INTEGER,
  minimum_price_cents INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendor_services_vendor ON vendor_services(vendor_id);
CREATE INDEX idx_vendor_services_type ON vendor_services(service_type);
```

#### orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  vendor_id UUID REFERENCES vendors(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  service_type VARCHAR(50) NOT NULL,
  lawn_sqft INTEGER NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('onetime', 'weekly', 'biweekly', 'monthly')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed')),
  scheduled_date DATE,
  time_window_start TIME,
  time_window_end TIME,
  subtotal_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  vendor_payout_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  special_instructions TEXT,
  completion_photos ARRAY(TEXT),
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_scheduled ON orders(scheduled_date);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

#### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  stripe_charge_id VARCHAR(255),
  stripe_payout_id VARCHAR(255),
  amount_cents INTEGER NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('charge', 'payout', 'refund', 'adjustment')),
  status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_stripe ON transactions(stripe_charge_id);
CREATE INDEX idx_transactions_type ON transactions(type);
```

#### satellite_estimates_cache
```sql
CREATE TABLE satellite_estimates_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 of normalized address
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  estimated_lawn_sqft INTEGER,
  confidence_score DECIMAL(5, 2),
  satellite_image_url TEXT,
  property_bounds_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_satellite_cache_hash ON satellite_estimates_cache(address_hash);
CREATE INDEX idx_satellite_cache_expires ON satellite_estimates_cache(expires_at);
```

## API Design

### RESTful Endpoints

#### Authentication
```
POST   /api/v1/auth/register          # Create new account
POST   /api/v1/auth/login             # Login
POST   /api/v1/auth/logout            # Logout
POST   /api/v1/auth/refresh           # Refresh JWT token
POST   /api/v1/auth/forgot-password   # Request password reset
POST   /api/v1/auth/reset-password    # Reset password with token
GET    /api/v1/auth/me                # Get current user profile
PUT    /api/v1/auth/me                # Update current user profile
```

#### Properties
```
GET    /api/v1/properties                  # List user's properties
POST   /api/v1/properties                  # Create new property
GET    /api/v1/properties/:id              # Get property details
PUT    /api/v1/properties/:id              # Update property
DELETE /api/v1/properties/:id              # Delete property
POST   /api/v1/properties/:id/estimate     # Get satellite lawn estimate
GET    /api/v1/properties/:id/image        # Get satellite image
```

#### Orders
```
GET    /api/v1/orders                      # List orders (context-aware)
POST   /api/v1/orders                      # Create new order
GET    /api/v1/orders/:id                  # Get order details
PUT    /api/v1/orders/:id                  # Update order
POST   /api/v1/orders/:id/accept           # Vendor accepts order
POST   /api/v1/orders/:id/decline          # Vendor declines order
POST   /api/v1/orders/:id/start            # Vendor starts job
POST   /api/v1/orders/:id/complete         # Vendor completes job
POST   /api/v1/orders/:id/review           # Customer leaves review
POST   /api/v1/orders/:id/cancel           # Cancel order
```

#### Vendors
```
GET    /api/v1/vendors                     # Search vendors by location
GET    /api/v1/vendors/:id                 # Get vendor public profile
PUT    /api/v1/vendors/profile             # Update vendor profile
GET    /api/v1/vendors/jobs                # Get available jobs
POST   /api/v1/vendors/jobs/:id/accept     # Accept specific job
POST   /api/v1/vendors/jobs/:id/decline    # Decline specific job
GET    /api/v1/vendors/earnings            # Get earnings summary
GET    /api/v1/vendors/analytics           # Get performance analytics
PUT    /api/v1/vendors/availability        # Set availability
```

### Request/Response Examples

#### Create Property with Satellite Estimate
```http
POST /api/v1/properties
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "address_line1": "123 Main St",
  "city": "Austin",
  "state": "TX",
  "zip_code": "78701",
  "request_satellite_estimate": true
}
```

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "address_line1": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip_code": "78701",
    "latitude": 30.267153,
    "longitude": -97.743057,
    "estimated_lawn_sqft": 5200,
    "lawn_estimate_confidence": 78.5,
    "satellite_image_url": "https://storage.googleapis.com/...",
    "created_at": "2026-09-09T01:00:00Z"
  }
}
```

#### Create Order
```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "property_id": "uuid",
  "service_type": "mowing",
  "frequency": "biweekly",
  "scheduled_date": "2026-09-15",
  "time_window_start": "09:00",
  "time_window_end": "12:00",
  "special_instructions": "Gate code is 1234"
}
```

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "total_cents": 6500,
    "platform_fee_cents": 1300,
    "vendor_payout_cents": 5200,
    "payment_intent_client_secret": "pi_xxx_secret_xxx",
    "created_at": "2026-09-09T01:00:00Z"
  }
}
```

## Security Architecture

### Authentication Flow
1. User registers/logs in with email/password
2. Server validates credentials, generates JWT access token (15min) + refresh token (7 days)
3. Access token stored in memory, refresh token in HTTP-only cookie
4. Client includes access token in Authorization header
5. On access token expiry, client uses refresh token to get new pair
6. On logout, both tokens are invalidated (Redis blacklist)

### Authorization
- Role-based access control (RBAC)
- Middleware checks user role and resource ownership
- Example: Only property owner can update/delete property
- Example: Only assigned vendor can complete order

### Data Protection
- All passwords hashed with bcrypt (cost factor 12)
- PII encrypted at rest (AES-256)
- HTTPS enforced (TLS 1.3)
- No card data stored (Stripe Elements)
- Rate limiting on auth endpoints (10 requests/min/IP)

### API Security
- Input validation with Zod schemas
- SQL injection prevention (Prisma parameterized queries)
- XSS protection (Content-Security-Policy headers)
- CSRF tokens for state-changing operations
- CORS policy restricting allowed origins

## Satellite Estimation Pipeline

### Architecture
```
User enters address
       ↓
Backend receives request
       ↓
Check Redis cache (24hr TTL)
       ↓
[MISS] → Call Google Maps Geocoding API
       ↓
Get coordinates (lat/lng)
       ↓
Call Google Static Maps API (zoom 19)
       ↓
Download satellite image (640x640)
       ↓
Upload to AWS S3 (public read URL)
       ↓
Call Computer Vision Service
       ↓
Analyze image for grass/turf detection
       ↓
Calculate sq ft (pixels × resolution factor)
       ↓
Store result in PostgreSQL + Redis cache
       ↓
Return estimate to client
```

### Computer Vision Service
```python
# Python microservice (FastAPI)
@app.post("/analyze")
async def analyze_lawn_area(image_url: str, property_bounds: dict):
    # Download image
    image = download_image(image_url)
    
    # Crop to property bounds
    cropped = crop_to_bounds(image, property_bounds)
    
    # Load pre-trained model
    model = load_model('lawn_detector_v1.h5')
    
    # Predict grass pixels
    prediction = model.predict(cropped)
    grass_mask = prediction > 0.7
    
    # Calculate area
    total_pixels = grass_mask.sum()
    sq_ft_per_pixel = 0.5  # At zoom 19
    estimated_sq_ft = total_pixels * sq_ft_per_pixel
    
    # Calculate confidence
    confidence = prediction.mean() * 100
    
    return {
        "estimated_sq_ft": round(estimated_sq_ft, -2),
        "confidence": confidence,
        "grass_percentage": (grass_mask.sum() / grass_mask.size) * 100
    }
```

### Caching Strategy
```javascript
// Node.js backend
const estimateCache = new NodeCache({ stdTTL: 86400 }); // 24 hours

async function getCachedEstimate(normalizedAddress) {
  const addressHash = crypto.createHash('sha256').update(normalizedAddress).digest('hex');
  
  // Check Redis first
  const cached = await redis.get(`satellite_estimate:${addressHash}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Check database
  const dbResult = await db.satellite_estimates_cache.findFirst({
    where: {
      address_hash: addressHash,
      expires_at: { gt: new Date() }
    }
  });
  
  if (dbResult) {
    // Populate Redis
    await redis.setex(
      `satellite_estimate:${addressHash}`,
      86400,
      JSON.stringify(dbResult)
    );
    return dbResult;
  }
  
  return null; // Cache miss
}
```

## Deployment Architecture

### Development
```bash
# Local development with Docker Compose
docker-compose up -d

# Services:
# - app (Node.js + Express)
# - postgres (PostgreSQL 14)
# - redis (Redis 7)
# - cv-service (Python + FastAPI)
```

### Production (AWS)
```
┌─────────────────────────────────────────────────────┐
│                    CloudFlare CDN                    │
│          (Static assets, DDoS protection)            │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              AWS Application Load Balancer          │
│           (SSL termination, health checks)          │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│   EC2 Instance │      │   EC2 Instance  │
│   (App Server) │      │   (App Server)  │
│   Dockerized   │      │   Dockerized    │
│   Auto-scaling │      │   Auto-scaling  │
└───────┬────────┘      └────────┬────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼────┐ ┌─────▼─────┐ ┌───▼────────┐
│ Amazon RDS │ │ElastiCache│ │   AWS S3   │
│ PostgreSQL │ │  Redis    │ │  (Images)  │
│ Multi-AZ   │ │  Cluster  │ │            │
└────────────┘ └───────────┘ └────────────┘
```

### CI/CD Pipeline (GitHub Actions)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker build -t lawn-pro-app .
      - run: docker push ${{ secrets.ECR_REPO }}/lawn-pro-app:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_KEY }}
          aws-region: us-east-1
      - run: aws ecs update-service --cluster lawn-pro --service app --force-new-deployment
```

## Monitoring & Observability

### Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Cache hit/miss ratios
- Satellite API costs per day
- Order conversion funnel
- Vendor acceptance rates
- Customer retention cohorts

### Alerting Rules
- API error rate > 1% (5-minute window)
- Response time p95 > 500ms (10-minute window)
- Database connections > 80% capacity
- Cache miss rate > 30% (sudden spike)
- Satellite API spend > $5/day
- Failed payments > 5% of attempts

### Logging Strategy
- Structured JSON logs (winston + pino)
- Correlation IDs for request tracing
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized logging (ELK Stack)
- Retention: 30 days hot, 90 days cold storage

---

*Last Updated: September 9, 2026*
*Version: 1.0*
