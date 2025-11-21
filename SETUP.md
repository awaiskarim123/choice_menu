# Setup and Run Instructions - Choice Menu Event Management

## Prerequisites

Before running the application, make sure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **PostgreSQL** database (local or cloud like Neon/Supabase)
- **npm** or **yarn** package manager

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- Prisma ORM
- JWT authentication
- React Hook Form
- Tailwind CSS
- And all other dependencies

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Or create `.env` manually with the following content:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/choice_menu?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="Choice Menu <noreply@choicemenu.com>"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# App
APP_URL="http://localhost:3000"
```

### Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as `JWT_SECRET` in your `.env` file.

## Step 3: Set Up Database

### Option A: Using Prisma Migrate (Recommended)

```bash
# Generate Prisma Client
npm run db:generate

# Create and run migrations
npm run db:migrate
```

### Option B: Push Schema Directly (Development Only)

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

## Step 4: Seed Database (Optional)

Seed the database with initial admin user and sample services:

```bash
npm run db:seed
```

This creates:
- **Admin User:**
  - Email: `admin@choicemenu.com`
  - Password: `admin123`
  - Role: ADMIN

- **Sample Services:**
  - Catering Service
  - Sound System
  - Lighting
  - Entertainment
  - Event Planning

## Step 5: Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

## Step 6: Access the Application

1. **Home Page:** http://localhost:3000
2. **Login:** http://localhost:3000/auth/login
3. **Register:** http://localhost:3000/auth/register
4. **Book Event:** http://localhost:3000/book-event
5. **Dashboard:** http://localhost:3000/dashboard

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database (dev)
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed database with initial data

# Linting
npm run lint         # Run ESLint
```

## Database Management

### Prisma Studio

View and edit your database through a GUI:

```bash
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555

### Create Admin User Manually

If you didn't run the seed script, you can create an admin user:

1. Open Prisma Studio: `npm run db:studio`
2. Go to the `User` model
3. Click "Add record"
4. Fill in:
   - Name: Your name
   - Email: admin@choicemenu.com
   - Phone: 03001234567
   - Password: (hash it using bcrypt - use online tool or run a script)
   - Role: ADMIN

Or use the seed script which handles password hashing automatically.

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials
- For cloud databases, ensure SSL is enabled if required

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Not Generated

```bash
npm run db:generate
```

### JWT Authentication Issues

- Verify `JWT_SECRET` is set (minimum 32 characters)
- Clear browser localStorage
- Check token expiration in `JWT_EXPIRES_IN`

## Project Structure

```
choice_menu/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── events/       # Event management
│   │   ├── services/     # Service management
│   │   └── ...
│   ├── auth/             # Auth pages
│   ├── dashboard/        # Dashboard pages
│   └── ...
├── components/           # React components
├── lib/                  # Utility functions
├── prisma/              # Database schema
├── public/              # Static files
└── ...
```

## Next Steps

1. **Create your first admin user** (if not seeded)
2. **Add services** through admin dashboard
3. **Test event booking** flow
4. **Configure email** settings for notifications
5. **Set up file uploads** directory permissions

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

## Support

For issues or questions:
- Check the [README.md](./README.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- Check Prisma documentation: https://www.prisma.io/docs
- Check Next.js documentation: https://nextjs.org/docs

