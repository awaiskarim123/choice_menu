# Choice Menu - Event Management Website

A full-stack event management and catering website built with Next.js, PostgreSQL, and Prisma.

## Features

### Public Features
- Home page with services overview
- About page
- Contact page
- Services listing page
- Event booking form

### Customer Dashboard
- View all bookings
- Track event status
- View payment schedule
- Upload CNIC documents
- Edit profile

### Admin Dashboard
- View all bookings
- Update booking status
- Manage services and pricing
- View customers
- View payment timelines
- Search, sort, and filter bookings
- Dashboard analytics

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod, React Hook Form
- **UI Components**: Radix UI, Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd choice_menu
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/choice_menu?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="Choice Menu <noreply@choicemenu.com>"
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (for development)
npm run db:push
```

5. Create an admin user (optional):
You can create an admin user directly in the database or through a seed script.

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
choice_menu/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── admin/             # Admin pages
│   └── ...                # Public pages
├── components/            # React components
│   ├── ui/               # UI components
│   └── dashboard/        # Dashboard components
├── lib/                   # Utility functions
├── prisma/               # Prisma schema and migrations
├── public/               # Static files
└── types/                # TypeScript types
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Events
- `GET /api/events` - Get all events (with filters)
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get event by ID
- `PATCH /api/events/[id]` - Update event status
- `DELETE /api/events/[id]` - Delete event

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service (Admin only)
- `GET /api/services/[id]` - Get service by ID
- `PATCH /api/services/[id]` - Update service (Admin only)
- `DELETE /api/services/[id]` - Delete service (Admin only)

### Payments
- `PATCH /api/payments/[id]` - Update payment status

### Upload
- `POST /api/upload` - Upload documents (CNIC)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Admin only)

## Payment Schedule

The system automatically generates a payment schedule:
- **20%** - First payment (due immediately)
- **50%** - Second payment (due 5 days before event)
- **30%** - Final payment (due after event)

## Cancellation Policy

- If cancellation is made less than 7 days before the event, a 20% deduction applies
- Full refund if cancelled 7+ days before the event

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Setup (Neon/Supabase)

1. Create a PostgreSQL database on Neon or Supabase
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npm run db:migrate`

## Environment Variables

See `.env.example` for all required environment variables.

## License

Private - Choice Menu (Private Limited)
