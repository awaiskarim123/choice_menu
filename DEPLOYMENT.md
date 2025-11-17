# Deployment Guide - Choice Menu Event Management Website

This guide will help you deploy the Choice Menu application to production.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Neon, Supabase, or any PostgreSQL provider)
- Email service (Gmail, SendGrid, etc.)

## Step 1: Database Setup

### Option A: Neon (Recommended)

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@host/dbname?sslmode=require`)
4. Save this for later

### Option B: Supabase

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Save this for later

## Step 2: Prepare Your Code

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 4: Configure Environment Variables

In Vercel dashboard, go to your project > Settings > Environment Variables and add:

```env
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=generate-a-random-secret-here-min-32-characters
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Choice Menu <noreply@choicemenu.com>
APP_URL=https://your-domain.vercel.app
```

### Generate JWT_SECRET

Run this command to generate a secure secret (minimum 32 characters):
```bash
openssl rand -base64 32
```

### Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use this password in `SMTP_PASSWORD`

## Step 5: Run Database Migrations

After deployment, you need to run migrations. You can do this in two ways:

### Option A: Using Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
```

### Option B: Using Prisma Studio (Temporary)

1. Set up a local `.env` file with production `DATABASE_URL`
2. Run: `npx prisma migrate deploy`
3. Or use Prisma Studio: `npx prisma studio`

### Option C: Direct Database Access

Connect to your database and run the SQL from Prisma migrations manually.

## Step 6: Seed Initial Data

After migrations, seed the database:

```bash
# Set DATABASE_URL in your local .env
npm run db:seed
```

Or manually create an admin user in the database.

## Step 7: Verify Deployment

1. Visit your Vercel deployment URL
2. Test registration and login
3. Create a test event booking
4. Verify admin dashboard access

## Step 8: Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` and `APP_URL` environment variables
4. Configure DNS as instructed by Vercel

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Sample services seeded
- [ ] Environment variables configured
- [ ] Email service working
- [ ] File uploads directory exists (Vercel handles this automatically)
- [ ] Test registration flow
- [ ] Test booking flow
- [ ] Test admin dashboard
- [ ] Test payment schedule generation

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if your database allows connections from Vercel IPs
- Ensure SSL is enabled if required

### Authentication Issues

- Verify `JWT_SECRET` is set (minimum 32 characters)
- Check token expiration settings in `JWT_EXPIRES_IN`
- Clear browser localStorage and try again
- Verify token is being sent in Authorization header

### File Upload Issues

- Vercel has a 4.5MB limit for serverless functions
- Consider using cloud storage (S3, Cloudinary) for production
- Update upload endpoint to use cloud storage

### Email Not Sending

- Verify SMTP credentials
- Check spam folder
- Test with a different email service if needed

## Production Optimizations

1. **File Storage**: Move file uploads to cloud storage (S3, Cloudinary)
2. **CDN**: Use Vercel's CDN for static assets
3. **Caching**: Implement Redis for session storage
4. **Monitoring**: Set up error tracking (Sentry)
5. **Backups**: Set up automated database backups
6. **Rate Limiting**: Implement rate limiting for API routes
7. **Security**: Enable HTTPS, set security headers

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)

