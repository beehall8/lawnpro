# 🌱 Lawn Pro

A modern two-sided marketplace connecting homeowners with professional lawn care service providers.

## Overview

Lawn Pro is a responsive web platform that enables:
- **Homeowners** to easily book lawn care services (mowing, trimming, edging, fertilizing, etc.)
- **Lawn Care Professionals** to find jobs, manage schedules, and grow their business

## Features

### For Customers
- 🏡 Simple booking flow with address-based service area validation
- 🛰️ **Hybrid Satellite Estimation** - AI-powered lawn size estimation using Google Maps + computer vision
- 💰 Transparent pricing based on actual lawn square footage
- 📸 Before/after photo gallery of completed work
- ⭐ Vendor ratings and reviews
- 🔔 Real-time service tracking

### For Vendors
- 💼 Job board with nearby opportunities
- ✅ One-click accept/decline workflow
- 📅 Integrated calendar and route optimization
- 💵 Earnings dashboard with analytics
- 📷 Mobile-friendly photo upload for job completion
- 🗺️ Map view for efficient routing

## Tech Stack

### Frontend
- React.js / Vue.js (TBD)
- Google Maps JavaScript API
- Responsive design (mobile-first)

### Backend
- Node.js + Express
- PostgreSQL
- Redis (caching)

### AI/ML
- Google Maps Platform (Geometry API, Static Maps API)
- TensorFlow.js / Python microservice for grass detection
- Custom ML model trained on vendor-verified measurements

### Infrastructure
- Cloud hosting (AWS/GCP/Azure)
- CI/CD pipeline
- Monitoring and logging

## Hybrid Satellite Estimation System

Lawn Pro uses a unique hybrid approach for accurate lawn size estimation:

1. **Satellite Imagery** - Google Maps fetches high-res property images
2. **Computer Vision** - AI detects grass/turf areas (~70-80% initial accuracy)
3. **Customer Adjustment** - Manual override slider (+/- 50%)
4. **Vendor Verification** - On-site measurement confirmation
5. **Continuous Learning** - System improves with every verified job

**Cost:** ~$50-100/month at 1,000 quotes

## Project Structure

```
lawn-pro/
├── README.md
├── docs/
│   ├── product-specs.md
│   ├── technical-architecture.md
│   └── api-documentation.md
├── assets/
│   └── mockups/          # Design mockups (homepage, booking flow, dashboards)
├── src/
│   ├── frontend/         # React/Vue application
│   ├── backend/          # Node.js API server
│   └── ml/               # Computer vision models
└── config/
    └── google-maps/      # API configuration
```

## Mockups

Four responsive website mockups have been created:

1. **Homepage** - Landing page with dual CTAs for customers and vendors
2. **Customer Booking** - Service selection with progress tracker
3. **Vendor Dashboard** - Job board with earnings summary
4. **Service Completion** - Before/after photo upload interface

All mockups are stored in `assets/mockups/`

## Development Phases

### Phase 1: MVP (Months 1-2)
- [ ] Basic booking flow (manual lawn size input)
- [ ] Vendor registration and profile creation
- [ ] Job posting and acceptance system
- [ ] Payment integration (Stripe)

### Phase 2: Satellite Integration (Months 3-4)
- [ ] Google Maps Platform integration
- [ ] Address geocoding and property boundary detection
- [ ] Customer adjustment UI (slider)
- [ ] Caching layer for cost optimization

### Phase 3: Computer Vision (Months 5-6)
- [ ] Grass/turf detection model integration
- [ ] Confidence scoring system
- [ ] Vendor verification workflow
- [ ] Training data collection pipeline

### Phase 4: Machine Learning (Months 7-9)
- [ ] Custom ML model training on verified data
- [ ] Continuous improvement loop
- [ ] Advanced features (seasonal recommendations, upselling)

### Phase 5: Scale & Optimize (Months 10+)
- [ ] Performance optimization
- [ ] Multi-region expansion
- [ ] Additional services (landscaping, snow removal)

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Redis 7+
- Google Maps Platform API key

### Installation

```bash
# Clone the repository
git clone https://github.com/bhallcm/lawn-pro.git
cd lawn-pro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

## API Keys Required

- **Google Maps Platform** - Geocoding, Static Maps, Geometry APIs
- **Stripe** - Payment processing
- **(Optional)** AWS/GCP - ML model hosting

## Cost Estimates

| Service | Monthly Cost (1K quotes) |
|---------|-------------------------|
| Google Maps APIs | $50-100 |
| Hosting (AWS/GCP) | $100-300 |
| Database (PostgreSQL) | $50-150 |
| Stripe Fees | 2.9% + $0.30/transaction |
| **Total** | ~$200-550 + transaction fees |

## Team

- **Founder:** Bhallcm
- **Development:** In Progress

## License

Proprietary - All rights reserved

## Contact

For questions or partnership inquiries, reach out to the project owner.

---

🚀 *Building the future of lawn care, one yard at a time.*
