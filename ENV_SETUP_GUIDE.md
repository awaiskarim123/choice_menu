# Environment Variables Setup Guide

This guide explains how to set up all the credentials in your `.env` file.

## Required Environment Variables

### 1. Database Configuration (Line 1-2)

**DATABASE_URL** - Your PostgreSQL database connection string

#### For Local Development:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/choice_menu?schema=public"
```

#### For Cloud Databases (Neon, Supabase, Railway):
```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

**How to get it:**
- **Neon**: Go to your project → Copy connection string
- **Supabase**: Settings → Database → Connection string (URI)
- **Railway**: PostgreSQL service → Variables → DATABASE_URL

---

### 2. JWT Authentication (Lines 4-5)

**JWT_SECRET** - Secret key for signing JWT tokens (minimum 32 characters)

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

**Example output:**
```
N5PRPsMAzLG5XHUDbr/9EpiAOXiD2TI+jPwuGd8z5Ic=
```

**Add to .env:**
```env
JWT_SECRET="N5PRPsMAzLG5XHUDbr/9EpiAOXiD2TI+jPwuGd8z5Ic="
JWT_EXPIRES_IN="7d"
```

⚠️ **Important:** 
- Never share your JWT_SECRET
- Use a different secret for production
- Minimum 32 characters required

---

### 3. Email Configuration (Lines 6-9)

**For Gmail SMTP:**

1. **Enable 2-Step Verification** on your Google Account
2. **Generate App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and device
   - Copy the 16-character password

3. **Add to .env:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-character-app-password"
SMTP_FROM="Choice Menu <noreply@choicemenu.com>"
```

**Alternative Email Providers:**

**SendGrid:**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="Choice Menu <noreply@choicemenu.com>"
```

**Outlook/Hotmail:**
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_USER="your-email@outlook.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="Choice Menu <noreply@choicemenu.com>"
```

---

## Complete .env File Template

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/choice_menu?schema=public"

# JWT Authentication
JWT_SECRET="your-generated-secret-min-32-characters"
JWT_EXPIRES_IN="7d"

# Email Configuration (Optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="Choice Menu <noreply@choicemenu.com>"

# File Upload (Optional)
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# App URL
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Quick Setup Steps

1. **Create `.env` file in the root directory:**
   ```bash
   touch .env
   ```

2. **Generate JWT Secret:**
   ```bash
   openssl rand -base64 32
   ```

3. **Copy the template above and fill in:**
   - Replace `DATABASE_URL` with your PostgreSQL connection string
   - Replace `JWT_SECRET` with the generated secret
   - Replace email credentials (if using email features)

4. **Save the file**

5. **Restart your development server:**
   ```bash
   npm run dev
   ```

---

## Verification

After setting up, verify your environment variables are loaded:

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Or in Node.js
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

---

## Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env` file is in the root directory
- Check for typos in variable names
- Restart your development server

### "JWT_SECRET must be at least 32 characters"
- Generate a new secret using `openssl rand -base64 32`
- Make sure there are no quotes or spaces

### Email not working
- Verify 2-Step Verification is enabled (for Gmail)
- Use App Password, not your regular password
- Check SMTP credentials are correct
- Test with a simple email client first

---

## Security Notes

- ✅ Never commit `.env` to Git (it's in `.gitignore`)
- ✅ Use different secrets for development and production
- ✅ Rotate JWT_SECRET periodically
- ✅ Use environment variables in production (Vercel, etc.)

