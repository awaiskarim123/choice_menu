# Quick Start Guide - Choice Menu Event Management

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/choice_menu?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
JWT_EXPIRES_IN="7d"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="Choice Menu <noreply@choicemenu.com>"
APP_URL="http://localhost:3000"
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### 3. Set Up Database
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (creates admin user and sample services)
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access Application
- **URL:** http://localhost:3000
- **Admin Login:**
  - Email: `admin@choicemenu.com`
  - Password: `admin123`

## 📋 What's Included

✅ **Complete Event Booking Form** - Matches your form design
✅ **JWT Authentication** - Secure token-based auth
✅ **Payment Schedule** - Automatic 20%, 50%, 30% split
✅ **Service Management** - Admin can add/edit services
✅ **Dashboard** - Customer and Admin dashboards
✅ **File Upload** - CNIC document upload
✅ **Email Notifications** - Booking confirmations

## 🎯 Key Features

### Event Booking Form Includes:
- Client Information (Name, Phone, CNIC, Address)
- Event Details (Type, Start/End Date & Time, Venue, Guests)
- Food Included (Yes/No) with number of people served
- Tent Service with custom amount
- Service Selection (checkboxes)
- Payment Schedule (20%, 50%, 30%)
- Cancellation & Delay Policies
- Special Notes/Requests

### APIs Connected:
- ✅ `/api/auth/login` - User login
- ✅ `/api/auth/register` - User registration
- ✅ `/api/events` - Create/Get events
- ✅ `/api/events/[id]` - Get/Update/Delete event
- ✅ `/api/services` - Manage services
- ✅ `/api/upload` - Upload CNIC documents
- ✅ `/api/payments/[id]` - Update payment status
- ✅ `/api/dashboard/stats` - Dashboard analytics

## 📝 Next Steps

1. **Customize Services** - Add your services via admin dashboard
2. **Configure Email** - Set up SMTP for notifications
3. **Test Booking Flow** - Create a test event booking
4. **Review Policies** - Update cancellation/delay policies if needed

## 🆘 Need Help?

- See [SETUP.md](./SETUP.md) for detailed setup instructions
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [README.md](./README.md) for full documentation

## 🔧 Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:studio    # Open database GUI
npm run db:seed      # Seed database
```

