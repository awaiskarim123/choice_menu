# 🚀 Deploy to Vercel - Complete Guide

This guide will walk you through deploying your Choice Menu application to Vercel step by step.

## Prerequisites

- ✅ GitHub account (or GitLab/Bitbucket)
- ✅ Vercel account ([Sign up here](https://vercel.com/signup))
- ✅ PostgreSQL database (Neon, Supabase, or Railway)
- ✅ Node.js 18+ installed locally

---

## Step 1: Prepare Your Code Repository

### 1.1 Initialize Git (if not already done)

```bash
cd /home/awais-karim/choice_menu
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 1.2 Push to GitHub

1. Create a new repository on GitHub (don't initialize with README)
2. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/choice-menu.git
git branch -M main
git push -u origin main
```

**Note:** Make sure `.env` is in `.gitignore` (it should be already).

---

## Step 2: Set Up PostgreSQL Database

You need a PostgreSQL database. Here are the best free options:

### Option A: Neon (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Click "Create Project"
3. Choose a name (e.g., "choice-menu")
4. Select a region closest to you
5. Click "Create Project"
6. Copy the connection string (it looks like: `postgresql://user:password@host/dbname?sslmode=require`)
7. **Save this connection string** - you'll need it in Step 4

### Option B: Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in project details
4. Wait for database to be created
5. Go to **Settings** → **Database**
6. Copy the connection string under "Connection string" → "URI"
7. **Save this connection string**

### Option C: Railway (Free Tier with Credit Card)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project"
3. Click "Provision PostgreSQL"
4. Go to the PostgreSQL service → **Variables** tab
5. Copy the `DATABASE_URL` value
6. **Save this connection string**

---

## Step 3: Run Database Migrations

Before deploying, set up your database schema:

### 3.1 Set DATABASE_URL locally

Create a `.env` file (if you don't have one):

```bash
DATABASE_URL="your-postgresql-connection-string-from-step-2"
```

### 3.2 Generate Prisma Client and Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Or if you prefer to push schema directly (for initial setup)
npm run db:push
```

### 3.3 (Optional) Seed the Database

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@choicemenu.com` / `admin123`
- Sample services

---

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository (`choice-menu`)
5. Click **"Import"**

### 4.2 Configure Project Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### 4.3 Add Environment Variables

**⚠️ IMPORTANT:** Add these before clicking "Deploy"

Click **"Environment Variables"** and add:

#### Required Variables:

```env
# Database
DATABASE_URL=your-postgresql-connection-string-from-step-2

# JWT Authentication
JWT_SECRET=generate-a-random-secret-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# App URL (will be your Vercel URL)
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

#### Optional Variables (for email notifications):

```env
# Email Configuration (if you want email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Choice Menu <noreply@choicemenu.com>
```

#### Generate JWT_SECRET

Run this command locally to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as `JWT_SECRET` in Vercel.

**Note:** For `NEXT_PUBLIC_APP_URL`, you can update it after the first deployment with your actual Vercel URL.

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://choice-menu-xyz.vercel.app`

---

## Step 5: Update Environment Variables

After the first deployment:

1. Go to your project in Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL:
   ```
   NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app
   ```
4. Go to **Deployments** tab
5. Click the three dots (⋯) on the latest deployment
6. Click **"Redeploy"** to apply the changes

---

## Step 6: Verify Deployment

1. Visit your Vercel URL
2. Test the home page loads correctly
3. Try registering a new user
4. Try logging in with admin credentials (if you seeded):
   - Email: `admin@choicemenu.com`
   - Password: `admin123`

---

## Step 7: Set Up Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `choicemenu.com`)
3. Follow Vercel's instructions to update DNS records
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Redeploy

---

## Troubleshooting

### Build Fails with Prisma Error

**Error:** `Prisma Client has not been generated yet`

**Solution:** The `postinstall` script should handle this. If it doesn't:
1. Check that `package.json` has `"postinstall": "prisma generate"`
2. Check that Prisma is in `dependencies` (not just `devDependencies`)

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Verify `DATABASE_URL` is correct in Vercel environment variables
2. Check that your database allows connections from Vercel's IPs
3. For Neon/Supabase, make sure SSL is enabled (`?sslmode=require`)

### Environment Variables Not Working

**Issue:** `process.env.VARIABLE` is undefined

**Solution:**
1. Variables starting with `NEXT_PUBLIC_` are available in the browser
2. Other variables are only available on the server
3. Make sure you've redeployed after adding environment variables
4. Check that variable names match exactly (case-sensitive)

### 401 Unauthorized Errors

**Issue:** Users can't log in after deployment

**Solution:**
1. Verify `JWT_SECRET` is set in Vercel
2. Make sure `JWT_SECRET` is at least 32 characters
3. If you changed `JWT_SECRET`, all existing tokens will be invalid (users need to log in again)

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | ✅ Yes | Secret key for JWT tokens (min 32 chars) | Generated with `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | ❌ No | JWT token expiration | `7d` (default) |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your app's public URL | `https://your-app.vercel.app` |
| `SMTP_HOST` | ❌ No | SMTP server for emails | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ No | SMTP port | `587` |
| `SMTP_USER` | ❌ No | SMTP username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | ❌ No | SMTP password/app password | Your Gmail app password |
| `SMTP_FROM` | ❌ No | Email sender name | `Choice Menu <noreply@choicemenu.com>` |

---

## Post-Deployment Checklist

- [ ] Database migrations applied successfully
- [ ] Environment variables set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` matches your Vercel URL
- [ ] Home page loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Admin dashboard accessible (if admin user exists)
- [ ] Event booking form works
- [ ] API endpoints respond correctly

---

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Run `npm install`
3. Run `npm run build`
4. Deploy the new version

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**🎉 Congratulations! Your Choice Menu application is now live on Vercel!**

