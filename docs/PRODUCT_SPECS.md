# Lawn Pro - Product Specifications

## Executive Summary

Lawn Pro is a two-sided marketplace platform connecting homeowners with lawn care service providers. The platform differentiates itself through AI-powered lawn size estimation using satellite imagery and computer vision, enabling accurate quotes and reducing vendor disputes.

## Target Users

### Primary Users
1. **Homeowners** (Ages 30-65)
   - Busy professionals who value convenience
   - Willing to pay premium for reliable service
   - Tech-comfortable, prefer online booking
   - Live in suburban areas with lawns 2,000-15,000 sq ft

2. **Lawn Care Professionals** (Small Business Owners)
   - 1-10 person crews
   - Already have equipment and insurance
   - Looking to fill schedule gaps
   - Comfortable with mobile technology
   - Annual revenue: $50K-$500K

### Secondary Users
- Property managers (multiple properties)
- Real estate companies (lawn maintenance for listings)
- Commercial properties (small office parks)

## Core Features

### MVP (Phase 1) - Months 1-2

#### Customer Features
- **User Registration & Profile**
  - Email/password or social login (Google, Facebook)
  - Address management (primary + additional properties)
  - Payment method storage (Stripe integration)
  
- **Service Booking Flow**
  - Address entry with geocoding
  - Service selection (mowing, trimming, edging, etc.)
  - Manual lawn size input (sq ft or acres)
  - Frequency selection (one-time, weekly, bi-weekly, monthly)
  - Date/time window selection
  - Real-time pricing display
  - Order confirmation with email/SMS

- **Order Management**
  - View active/completed orders
  - Reschedule or cancel (with policy enforcement)
  - Rate and review vendors
  - Photo gallery of completed work

#### Vendor Features
- **Vendor Onboarding**
  - Business registration form
  - Service area definition (zip codes, radius)
  - Service offerings and pricing configuration
  - Insurance/license upload (verification required)
  - Background check consent

- **Job Management**
  - Job board/feed with available requests
  - Filter by location, service type, payout
  - Accept/decline workflow
  - Calendar view of scheduled jobs
  - Customer contact info (post-acceptance)

- **Business Tools**
  - Earnings dashboard (daily/weekly/monthly)
  - Customer ratings and reviews
  - Profile customization (bio, photos, services)

#### Platform Features
- **Payment Processing**
  - Stripe integration
  - Customer charges (service + platform fee)
  - Vendor payouts (weekly direct deposit)
  - Platform commission (15-20%)

- **Notifications**
  - Email notifications (SendGrid/Amazon SES)
  - SMS notifications (Twilio)
  - Push notifications (future phase)

- **Trust & Safety**
  - Vendor verification process
  - Customer identity verification
  - Dispute resolution workflow
  - Insurance requirement enforcement

### Phase 2 - Satellite Integration (Months 3-4)

#### Hybrid Lawn Estimation System
- **Google Maps Platform Integration**
  - Address geocoding → coordinates
  - Property boundary detection
  - High-resolution satellite imagery fetch
  
- **Customer Adjustment UI**
  - Display AI estimate with confidence score
  - Manual override slider (+/- 50%)
  - Visual property outline overlay
  - Save adjusted size for future bookings

- **Caching Layer**
  - Redis cache for address estimates (24hr TTL)
  - Cost optimization (~$50-100/month at 1K quotes)

#### Enhanced Features
- **Dynamic Pricing**
  - Base price per sq ft
  - Service-specific modifiers
  - Frequency discounts
  - Seasonal adjustments

- **Service Area Validation**
  - Real-time vendor availability check
  - Travel time/distance calculations
  - Automatic rejection of out-of-area requests

### Phase 3 - Computer Vision (Months 5-6)

#### AI-Powered Grass Detection
- **Image Analysis Pipeline**
  - TensorFlow.js or Python microservice
  - Pre-trained land cover classification model
  - Grass/turf vs. hardscape detection
  - Confidence scoring (0-100%)

- **Accuracy Improvements**
  - Initial target: 70-80% accuracy
  - Human-in-the-loop validation
  - Vendor verification feedback loop

#### Vendor Mobile Experience
- **Job Completion Workflow**
  - Before/after photo capture (required)
  - Actual lawn measurement input
  - Notes/special instructions field
  - Customer signature capture (optional)

- **Data Collection**
  - Verified measurements stored for ML training
  - Geotagged photos with timestamps
  - Service duration tracking

### Phase 4 - Machine Learning (Months 7-9)

#### Custom ML Model
- **Training Pipeline**
  - Collect 500+ verified measurements
  - Feature engineering (location, season, property age, etc.)
  - Model training and validation
  - A/B testing against baseline

- **Continuous Improvement**
  - Quarterly model retraining
  - Performance monitoring dashboard
  - Accuracy metrics by region/property type

#### Advanced Features
- **Predictive Recommendations**
  - Service frequency suggestions
  - Upsell opportunities (aeration, fertilization)
  - Seasonal prep reminders

- **Smart Matching**
  - Vendor-customer compatibility scoring
  - Preferred vendor assignments
  - Route optimization for multi-job days

### Phase 5 - Scale & Optimize (Months 10+)

#### Performance & Scale
- **Infrastructure Optimization**
  - Database query optimization
  - CDN for static assets
  - Load balancing and auto-scaling
  - Multi-region deployment

- **Feature Expansion**
  - Additional services (landscaping, snow removal, gutter cleaning)
  - Subscription tiers (premium features)
  - B2B offerings (property management partnerships)

## Technical Architecture

### Frontend Stack
- **Framework:** React.js 18+ (or Vue.js 3+)
- **State Management:** Redux Toolkit / Zustand
- **Routing:** React Router v6
- **UI Components:** Tailwind CSS + Headless UI
- **Maps Integration:** Google Maps JavaScript API
- **Forms:** React Hook Form + Zod validation
- **Testing:** Jest + React Testing Library

### Backend Stack
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js 4+
- **API Style:** RESTful + GraphQL (for complex queries)
- **Authentication:** JWT + refresh tokens
- **Validation:** Joi or Zod
- **Documentation:** OpenAPI/Swagger

### Database
- **Primary:** PostgreSQL 14+
  - Users, vendors, orders, payments
  - Full-text search with tsvector
  - Row-level security for multi-tenant data
  
- **Cache:** Redis 7+
  - Session storage
  - API response caching
  - Rate limiting
  - Satellite estimate cache

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
- **Hosting:** AWS (EC2, RDS, ElastiCache) or GCP
- **Containerization:** Docker + Kubernetes (later phase)
- **CI/CD:** GitHub Actions
- **Monitoring:** DataDog or New Relic
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Backups:** Automated daily backups with 30-day retention

## Data Models (Simplified)

### Users
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('customer', 'vendor', 'admin'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Properties
```sql
properties (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  estimated_lawn_sqft INTEGER,
  verified_lawn_sqft INTEGER,
  satellite_image_url TEXT,
  created_at TIMESTAMP
)
```

### Vendors
```sql
vendors (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  business_name VARCHAR(255),
  ein VARCHAR(20),
  insurance_provider VARCHAR(255),
  insurance_policy_number VARCHAR(100),
  insurance_expiry DATE,
  license_number VARCHAR(100),
  service_radius_miles INTEGER,
  avg_rating DECIMAL(3, 2),
  total_jobs_completed INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
)
```

### Orders
```sql
orders (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES users(id),
  vendor_id UUID REFERENCES vendors(id),
  property_id UUID REFERENCES properties(id),
  service_type VARCHAR(50),
  lawn_sqft INTEGER,
  frequency ENUM('onetime', 'weekly', 'biweekly', 'monthly'),
  status ENUM('pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled'),
  scheduled_date DATE,
  time_window_start TIME,
  time_window_end TIME,
  subtotal DECIMAL(10, 2),
  platform_fee DECIMAL(10, 2),
  total DECIMAL(10, 2),
  created_at TIMESTAMP
)
```

## API Endpoints (Key Examples)

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

### Properties
```
GET    /api/v1/properties              # List user's properties
POST   /api/v1/properties              # Create new property
GET    /api/v1/properties/:id          # Get property details
PUT    /api/v1/properties/:id          # Update property
DELETE /api/v1/properties/:id          # Delete property
POST   /api/v1/properties/:id/estimate # Get satellite lawn estimate
```

### Orders
```
GET    /api/v1/orders                  # List orders (customer/vendor context)
POST   /api/v1/orders                  # Create new order
GET    /api/v1/orders/:id              # Get order details
PUT    /api/v1/orders/:id              # Update order
POST   /api/v1/orders/:id/accept       # Vendor accepts order
POST   /api/v1/orders/:id/decline      # Vendor declines order
POST   /api/v1/orders/:id/complete     # Vendor marks complete
POST   /api/v1/orders/:id/review       # Customer leaves review
```

### Vendors
```
GET    /api/v1/vendors                 # Search vendors by location
GET    /api/v1/vendors/:id             # Get vendor profile
PUT    /api/v1/vendors/profile         # Update vendor profile
GET    /api/v1/vendors/jobs            # Get available jobs
POST   /api/v1/vendors/availability    # Set availability
```

## Security Considerations

### Authentication & Authorization
- JWT tokens with 15-minute expiry
- Refresh tokens with 7-day expiry (rotating)
- Role-based access control (RBAC)
- Rate limiting on auth endpoints

### Data Protection
- HTTPS everywhere (TLS 1.3)
- Password hashing with bcrypt (cost factor 12)
- PII encryption at rest (AES-256)
- PCI compliance via Stripe (no card data stored)

### API Security
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy)
- CSRF tokens for state-changing operations

### Compliance
- GDPR compliance (EU users)
- CCPA compliance (California users)
- Data retention policies
- Right to deletion implementation

## Success Metrics

### Key Performance Indicators (KPIs)
- **Customer Acquisition Cost (CAC):** Target < $50
- **Lifetime Value (LTV):** Target > $500
- **LTV:CAC Ratio:** Target > 3:1
- **Monthly Active Users (MAU):** Growth rate 20% MoM
- **Order Completion Rate:** Target > 85%
- **Vendor Retention Rate:** Target > 70% at 6 months
- **Average Order Value (AOV):** Target $60-80
- **Net Promoter Score (NPS):** Target > 50

### Operational Metrics
- Time from booking to vendor acceptance (< 2 hours avg)
- Vendor response time (< 30 minutes avg)
- Dispute rate (< 2% of orders)
- Satellite estimate accuracy (> 80% within 10% margin)

## Go-to-Market Strategy

### Phase 1: Local Launch (Month 3)
- Single metro area (e.g., Austin, TX)
- Recruit 20-30 vetted vendors
- Soft launch with friends/family beta
- Iterate based on feedback

### Phase 2: City Expansion (Months 4-6)
- Expand to 3-5 similar markets
- Local SEO optimization
- Partner with neighborhood associations
- Referral program launch

### Phase 3: Regional Growth (Months 7-12)
- State-wide coverage in Texas
- Paid advertising (Google Ads, Facebook)
- Content marketing (lawn care tips blog)
- PR outreach to local media

### Phase 4: National Scale (Year 2+)
- Top 50 US metro areas
- Strategic partnerships (Home Depot, Lowe's)
- Franchise opportunities for top vendors
- Series A fundraising

## Risk Mitigation

### Technical Risks
- **Satellite API costs exceed estimates:** Implement aggressive caching, usage limits
- **ML model underperforms:** Maintain manual override, continuous retraining
- **Scale challenges:** Microservices architecture, horizontal scaling plan

### Business Risks
- **Chicken-and-egg problem:** Subsidize early vendors, guarantee minimum earnings
- **Vendor quality inconsistency:** Strict vetting, performance monitoring, removal process
- **Seasonality demand:** Diversify services (snow removal, leaf removal, holiday lighting)

### Legal Risks
- **Liability for property damage:** Require vendor insurance, platform liability waiver
- **Worker classification:** Vendors are independent contractors (clear agreements)
- **Data privacy breaches:** Regular security audits, incident response plan

---

*Last Updated: September 9, 2026*
*Version: 1.0*
