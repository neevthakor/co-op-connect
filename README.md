# 🤝 Co-opConnect

### Cooperative Gig-Service Platform for Household & Community Services

Co-opConnect is a community-focused gig-service platform that connects **customers with trusted local service providers** while enabling workers, cooperatives, housing societies, and institutions to participate in a unified service ecosystem.

The platform focuses on **trust, local employment, skill visibility, service discovery, booking management, worker verification, cooperative coordination, and AI-assisted matching**.

---

## 🌟 Why Co-opConnect?

Traditional gig platforms primarily focus on connecting customers with individual workers.

Co-opConnect introduces a **cooperative and community-oriented approach**, where service providers can operate through a trusted local workforce ecosystem.

### For Customers

- Discover nearby service providers
- Search by service category and location
- Compare worker profiles
- View skills and certifications
- Check ratings and trust indicators
- Book services
- Reuse previously saved service locations
- Track booking history
- Request emergency services
- Get AI-assisted service recommendations
- Receive intelligent worker matching

### For Workers

- Create a professional worker profile
- Showcase skills and certifications
- Manage service availability
- Receive and manage bookings
- Build reputation through completed services and reviews
- Manage helpers and teams
- Maintain a digital Trust Passport
- Participate in cooperative workforce operations

### For Cooperatives

- Manage cooperative workers
- Verify worker information
- Review service requests
- Coordinate workforce allocation
- Monitor workforce capacity
- Support fair worker assignment
- Participate in cooperative governance
- Share workforce capacity with other cooperatives

### For Housing Societies & Institutions

- Register as an organization
- Save and manage service locations
- Create service requests
- Request qualified local workers
- Track service requests
- Manage organization service history
- Manage recurring maintenance and service workflows

---

# ✨ Core Features

## 👤 Customer Platform

- Customer registration and authentication
- Personalized customer dashboard
- Service category discovery
- Location-based worker discovery
- Worker profile viewing
- Skills and certification information
- Worker Trust Passport
- Service booking
- Booking management
- Booking history
- Saved service locations
- Ratings and reviews
- Emergency service requests
- AI-assisted service discovery
- Intelligent worker matching

---

## 🧑‍🔧 Worker Platform

- Worker registration and authentication
- Professional worker profile
- Primary and secondary skills
- Certification management
- Experience information
- Service availability management
- Booking management
- Job workflow
- Job proof and completion records
- Ratings and reviews
- Trust Passport
- Helper management
- Team management
- Worker earnings
- Welfare and insurance information
- Training records
- Location-aware workforce operations

---

## 🏢 Cooperative Platform

Co-opConnect treats cooperatives as an important part of the service ecosystem.

Cooperative administrators can:

- Manage cooperative workers
- Review worker verification
- Monitor workforce capacity
- View service requests
- Review organization service requests
- Assign qualified workers
- Analyze workforce distribution
- Participate in cooperative proposals and voting
- Coordinate shared workforce requests

The platform is designed to support **fair and transparent workforce allocation** rather than simply maximizing individual worker utilization.

---

## 🏘️ Housing Society Platform

Housing societies can participate as organizational customers.

Features include:

- Society registration
- Society dashboard
- Organization profile
- Saved service locations
- Service request creation
- Service category selection
- Request tracking
- Worker discovery
- Worker assignment
- Booking linkage
- Service history
- Maintenance workflows
- Invoice and service information

---

## 🏛️ Institutional Platform

Institutions can request and manage services through a dedicated organizational workflow.

Features include:

- Institution registration
- Institution dashboard
- Organization locations
- Service requests
- Service management
- Worker assignment
- Booking linkage
- Contract management
- Service history
- Institutional service workflows

---

# 🛡️ Worker Trust Passport

One of the core concepts of Co-opConnect is the **Worker Trust Passport**.

It provides customers and organizations with a structured view of a worker's professional information before selecting them.

The Trust Passport can include:

- Skills
- Certifications
- Experience
- Ratings
- Reviews
- Completed services
- Verification status
- Professional information
- Trust indicators

This creates a more transparent and accountable service-selection process.

---

# ⚖️ FairMatch Worker Matching

Co-opConnect includes a dedicated worker-matching system designed to select suitable workers based on multiple factors.

Matching can consider:

- Skill compatibility
- Service category
- Geographic proximity
- Worker reliability
- Certification status
- Worker availability
- Workload and fairness
- Historical performance

The objective is not simply to select the nearest worker, but to provide a **fair and qualified assignment**.

---

# 🤖 AI-Powered Assistance

Co-opConnect includes an AI service layer for intelligent assistance and service matching.

The AI layer is designed to support:

- Natural-language service requests
- Service discovery
- Request understanding
- Service categorization
- Worker/service matching
- Intelligent recommendations
- Customer assistance

### AI Architecture

```text
                    Customer Request
                           │
                           ▼
                  ┌─────────────────┐
                  │   AI Service    │
                  │      Layer      │
                  └────────┬────────┘
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
          ┌──────────────┐    ┌────────────────┐
          │ Gemini API   │    │ Rule-based     │
          │              │    │ Fallback       │
          └──────────────┘    └────────────────┘
                 │                   │
                 └─────────┬─────────┘
                           ▼
                  Application Response
```

The application maintains a **rule-based fallback** so core service assistance can continue when the external AI provider is unavailable.

---

# 📍 Location-Aware Services

Location is an important part of the Co-opConnect service workflow.

The platform supports:

- Customer service locations
- Organization locations
- Worker location information
- Nearby worker discovery
- Distance-aware matching
- Location reuse for previous bookings
- Location-aware service requests

This allows the platform to connect service demand with an appropriate local workforce.

---

# 🚨 Emergency Services

Co-opConnect supports emergency-oriented service categories for urgent household and community requirements.

Examples include:

- Electrical emergencies
- Plumbing emergencies
- Water leakage
- Other urgent maintenance requirements

Emergency requests can be handled through the same service discovery and worker matching ecosystem.

---

# 📊 Workforce & Demand Intelligence

Co-opConnect includes data-driven capabilities for understanding workforce and service demand.

These capabilities include:

- Workforce capacity analysis
- Service demand history
- Demand forecasting
- Skill-gap analysis
- Geographic workforce analysis
- Cooperative workforce coordination
- Shared workforce requests

This creates a foundation for better workforce planning at cooperative and federation levels.

---

# 🏛️ Cooperative Governance

Co-opConnect includes cooperative governance functionality through proposals and voting.

The system can support:

- Cooperative proposals
- Member/admin voting
- Proposal status tracking
- Transparent cooperative decision-making

This aligns the platform with the cooperative model rather than treating workers only as independent gig providers.

---

# 🤝 Shared Cooperative Workforce

Cooperatives can coordinate workforce requirements through shared workforce requests.

This provides a foundation for:

- Requesting workers from another cooperative
- Offering available workforce capacity
- Coordinating cross-cooperative service demand
- Improving workforce utilization
- Supporting local cooperative collaboration

---

# 🧾 Service & Booking Workflow

The general service workflow is:

```text
Customer / Organization
          │
          ▼
   Create Service Request
          │
          ▼
    Select Service
          │
          ▼
      Add Location
          │
          ▼
   Find Qualified Workers
          │
          ▼
      FairMatch
          │
          ▼
    Select / Assign Worker
          │
          ▼
        Booking
          │
          ▼
      Worker Job
          │
          ▼
   Job Proof / Completion
          │
          ▼
     Rating / History
```

For organizational customers, the workflow additionally supports organization-specific service requests and service history.

---

# 🧰 Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide React
- Recharts
- Leaflet / React Leaflet

## Backend

- Next.js App Router
- Next.js Route Handlers
- Prisma ORM
- PostgreSQL
- Auth.js / NextAuth

## Database & Infrastructure

- PostgreSQL
- Supabase
- Supabase Storage
- Supabase Realtime

## AI

- Google Gemini API
- Rule-based fallback

## Authentication & Security

- Auth.js / NextAuth
- Credentials authentication
- bcrypt password hashing
- Role-based access control
- Protected application routes

---

# 🗂️ High-Level Architecture

```text
                         Co-opConnect
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
        Customer           Worker         Organizations
                                             │
                                      ┌──────┴──────┐
                                      ▼             ▼
                                   Society      Institution
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                       Service Requests
                              │
                              ▼
                         FairMatch
                              │
                              ▼
                           Booking
                              │
                              ▼
                       Worker Workflow
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
               Job Proof            Completion
                    │                   │
                    └─────────┬─────────┘
                              ▼
                       Ratings / History
```

---

# 🚀 Setup / Installation

## 1. Clone the repository

```bash
git clone https://github.com/neevthakor/co-op-connect.git
cd co-op-connect
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file based on `.env.example`.

Configure the required PostgreSQL/Supabase and application environment variables.

Do not commit `.env` or other files containing secrets.

## 4. Configure the database

Make sure the configured PostgreSQL database is available.

For development environments where schema synchronization is required:

```bash
npx prisma db push
```

## 5. Generate Prisma Client

```bash
npx prisma generate
```

## 6. Seed demo data

The repository contains demo-data seed scripts for development/testing.

**Important:** Do not run destructive seed scripts against a production database.

For the organization demo environment, use the dedicated organization seed/verification scripts where appropriate:

```bash
npm run db:seed:organization
npm run db:verify:organization
```

The main `npm run db:seed` script is intended for controlled development/demo database initialization and should **not** be executed against a database containing real application data.

## 7. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Development Commands

```bash
npm run dev
```

Start the development server.

```bash
npm run build
```

Create a production build.

```bash
npm run lint
```

Run ESLint.

```bash
npx tsc --noEmit
```

Run TypeScript type checking.

```bash
npx prisma generate
```

Generate the Prisma Client.

```bash
npx prisma studio
```

Open Prisma Studio.

```bash
npm run db:seed:organization
```

Create organization demo data.

```bash
npm run db:verify:organization
```

Verify organization demo data.

---

# ⚠️ Database Safety

**Do not run destructive seed scripts against production data.**

In particular:

```bash
npm run db:seed
```

can reset/recreate demo data and should only be used against a disposable development/demo database.

For production deployments:

- Use the production database configuration intentionally.
- Do not execute destructive seed scripts.
- Review Prisma schema changes before applying them.
- Keep database backups available before potentially destructive migrations or data operations.

---

# 🔐 Security

The project uses role-based access control for different application areas.

Supported application roles include:

- Customer
- Worker
- Cooperative Administrator
- Federation Administrator
- Society Administrator
- Institutional Customer

Authentication uses hashed passwords and protected application routes.

Secrets such as database credentials, authentication secrets, API keys, and service-role keys must be stored in environment variables and must never be committed to Git.

---

# 📁 Project Structure

```text
co-op-connect/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── scripts/
│   ├── seed-organization-demo.ts
│   └── verify-organization-demo.ts
│
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── cooperative/
│   │   ├── customer/
│   │   ├── institution/
│   │   ├── society/
│   │   ├── worker/
│   │   └── api/
│   │
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   └── types/
│
├── .env.example
├── implementation_plan.md
├── package.json
└── README.md
```

---

# 🎯 Project Objective

Co-opConnect aims to demonstrate how a cooperative-based digital platform can improve access to household and community services while creating a structured ecosystem for local workers and organizations.

The platform combines:

- Local service discovery
- Worker verification
- Skill and certification visibility
- Fair worker matching
- Cooperative workforce management
- Organization service requests
- Trust and reputation
- AI-assisted service discovery
- Demand and workforce intelligence
- Cooperative governance

The goal is to build a service ecosystem that is **local, transparent, fair, trusted, and cooperative-oriented**.

---

# 📌 Project Status

Co-opConnect is being developed as a functional prototype for the **Smart India Hackathon (SIH) 2026** problem statement:

> **SIH26089 — Cooperative Gig Services Platform for Household & Community Services**

The implementation focuses on real application workflows backed by PostgreSQL/Prisma rather than purely static or mock interfaces.

---

# 📄 License

This project is currently developed as an academic and hackathon project.
