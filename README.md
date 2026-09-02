Co-opConnect 🤝
Cooperative Gig-Service Platform for Household & Community Services

Co-opConnect is a cooperative gig-services platform designed to connect customers, skilled workers, cooperatives, societies, and institutions through a trusted, transparent, and community-driven service ecosystem.

The platform enables users to discover local service providers, book services, manage jobs, build worker profiles, verify skills, and establish trust through ratings and worker credentials.

🚀 Vision

Traditional gig platforms often focus primarily on individual workers and platform profit.

Co-opConnect takes a cooperative approach.

The goal is to create a system where:

Customers can find trustworthy local service providers.
Workers can showcase their skills and build their professional identity.
Cooperatives and communities can organize and support local workers.
Institutions and societies can access reliable service networks.
Trust is built through verified profiles, certifications, ratings, and transparent service history.
✨ Key Features
👤 Customer
Customer registration and authentication
Browse service categories
Discover available workers
View worker profiles
View worker skills and certifications
Worker trust information
Book services
Track bookings
Rate completed services
View service history
AI-assisted service discovery
🧑‍🔧 Worker
Worker registration
Worker profile management
Skills and expertise
Certifications
Service availability
Booking management
Customer/job information
Worker dashboard
Helper/team management
Ratings and reviews
Trust Passport
🛡️ Trust & Verification

Co-opConnect is designed around a trust-based service ecosystem.

The platform can represent:

Worker skills
Certifications
Experience
Ratings
Reviews
Service history
Trust indicators
Cooperative/community association

This helps customers make more informed decisions before booking a worker.

🤖 AI Assistance

Co-opConnect includes an AI service layer designed to assist users with:

Natural-language service requests
Service discovery
Worker/service matching
Customer assistance
Intelligent recommendations

The application also includes a fallback rule-based mechanism so AI-dependent functionality can degrade gracefully when the external AI service is unavailable.

🏢 Admin

Administrative functionality includes:

Worker management
Worker profile inspection
Welfare-related management
Platform administration
Role-based access control
⭐ Reviews & Ratings

Customers can rate completed services and provide feedback.

Ratings contribute to the worker's overall reputation and help future customers evaluate service providers.

🏗️ Architecture

Co-opConnect is currently implemented as a Next.js monolithic application.

┌─────────────────────────────────────────────┐
│                  Co-opConnect               │
├─────────────────────────────────────────────┤
│                                             │
│              Next.js Application             │
│                                             │
│  ┌──────────────┐     ┌──────────────────┐  │
│  │   Frontend   │     │   API Routes     │  │
│  │              │     │                  │  │
│  │ Customer UI  │     │ Authentication   │  │
│  │ Worker UI    │     │ Bookings         │  │
│  │ Admin UI     │     │ Workers          │  │
│  │              │     │ Reviews          │  │
│  └──────────────┘     │ AI / Matching    │  │
│                       └────────┬─────────┘  │
│                                │            │
│                         ┌──────▼──────┐     │
│                         │   Prisma    │     │
│                         │     ORM     │     │
│                         └──────┬──────┘     │
│                                │            │
│                         ┌──────▼──────┐     │
│                         │  Database   │     │
│                         └─────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
🛠️ Tech Stack
Technology	Purpose
Next.js	Full-stack web application
React	Frontend UI
TypeScript	Type-safe development
Prisma	Database ORM
SQLite	Local development database
NextAuth/Auth.js	Authentication
Tailwind CSS	UI styling
Gemini API	AI capabilities
Git & GitHub	Version control and collaboration
📁 Project Structure
co-op-connect/
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── scripts/
│   ├── test-gemini-ai.ts
│   ├── test-real-auth-flow.ts
│   ├── test-real-data-flow.ts
│   └── test-reviews-flow.ts
│
├── src/
│   │
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── customer/
│   │   ├── register/
│   │   └── worker/
│   │
│   ├── components/
│   │   └── shared/
│   │
│   ├── services/
│   │   ├── ai.ts
│   │   ├── gemini.ts
│   │   └── worker-profile.ts
│   │
│   ├── types/
│   │
│   ├── lib/
│   │   ├── auth.ts
│   │   └── rbac.ts
│   │
│   └── middleware.ts
│
├── package.json
├── package-lock.json
└── README.md
⚙️ Getting Started
1. Clone the repository
git clone https://github.com/neevthakor/co-op-connect.git
cd co-op-connect
2. Install dependencies
npm install
3. Configure environment variables

Create a local .env file:

DATABASE_URL="file:./dev.db"

Add the authentication and AI environment variables required by the application.

Never commit .env to GitHub.

A team member should maintain their own local environment configuration.

4. Set up Prisma

Generate the Prisma client:

npx prisma generate

Create/update the local database:

npx prisma db push
5. Start the development server
npm run dev

The application will be available at:

http://localhost:3000
🧪 Testing

The project contains scripts for testing important application flows.

Examples include:

scripts/
├── test-gemini-ai.ts
├── test-real-auth-flow.ts
├── test-real-data-flow.ts
└── test-reviews-flow.ts

These are intended to help verify that the application is using real database-backed flows rather than dummy production data.

Before opening a pull request, verify:

Application starts successfully
Registration works
Login works
Customer dashboard loads
Worker dashboard loads
Worker profiles load
Service discovery works
Booking flow works
Reviews/ratings work
API routes return expected responses
Database operations succeed
🔐 Authentication & Authorization

Co-opConnect uses authentication together with role-based access control.

The platform contains role-specific experiences for:

Customer
Worker
Admin
Society
Institution

Authorization is enforced through the application's authentication, RBAC, and middleware layers.

🤖 AI Architecture

AI functionality is separated from the application's core business logic.

User Request
     │
     ▼
AI Service Layer
     │
     ├───────────────► Gemini API
     │
     │
     └───────────────► Rule-based fallback
                              │
                              ▼
                         Application

This separation allows AI functionality to evolve independently from the core booking and service-management system.

👥 Team Development

For team development, do not directly make all changes on main.

Create a feature branch:

git checkout -b feature/your-feature-name

Example:

git checkout -b feature/worker-dashboard

After making changes:

git add .
git commit -m "feat: improve worker dashboard"
git push -u origin feature/worker-dashboard

Then create a Pull Request against main.

Recommended workflow
main
 │
 ├── feature/customer-booking
 │
 ├── feature/worker-dashboard
 │
 ├── feature/ai-matching
 │
 └── feature/admin-panel

This prevents multiple developers from accidentally overwriting each other's work.

📌 Development Principles

The project follows several important principles:

Real Data

Core application flows should use the actual database rather than hardcoded production data.

Modular Services

External integrations such as AI should remain isolated in service modules.

Role-Based Access

Users should only access functionality permitted by their role.

Secure Configuration

Secrets and environment-specific credentials must remain outside version control.

Maintainable Code

New functionality should fit into the existing application architecture rather than introducing unnecessary parallel systems.

🗺️ Roadmap

Planned improvements include:

Complete AI-powered service matching

Improve worker recommendation system

Advanced worker verification

Cooperative management features

Society/institution workflows

Real-time booking updates

Notifications

Payment integration

Location-aware worker discovery

Advanced analytics

Production database deployment

Production authentication configuration

Production deployment

🎯 Project Goal

Co-opConnect aims to build more than a conventional gig marketplace.

The long-term goal is a community-centered digital service infrastructure where:

Customers
    │
    ▼
Trusted Service Discovery
    │
    ▼
Skilled Workers
    │
    ▼
Cooperatives / Communities
    │
    ▼
Sustainable Local Service Ecosystem

The platform is designed to improve trust, accessibility, worker visibility, and community participation in household and local services.

📄 License

This project is currently developed as part of a student innovation/project initiative.

License and contribution policies may be updated as the project evolves.

👨‍💻 Development

Built with:

Next.js + TypeScript + Prisma + React + AI

Repository:

https://github.com/neevthakor/co-op-connect