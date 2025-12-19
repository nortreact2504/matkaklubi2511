# Environment Variables Setup

## Step 9: Configure Environment Variables

You need to add the following variables to your `.env` file:

### Required Variables

```env
# MongoDB Configuration (already exists)
MONGODB_USER=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password

# Session Configuration (NEW - add these)
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=development

# Port (optional)
PORT=8085
```

### How to Generate a Secure SESSION_SECRET

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 64
```

**Option 3: Online Generator**
Visit: https://randomkeygen.com/ and use "CodeIgniter Encryption Keys" (256-bit)

### Important Notes

- The `SESSION_SECRET` should be at least 32 characters long
- Use a different secret in production than in development
- Never commit `.env` file to git (it should already be in .gitignore)
- The secret is used to sign session cookies
- If you change the secret, all existing sessions will be invalidated

### Example .env File

```env
MONGODB_USER=matkaklubi_user
MONGODB_PASSWORD=MySecurePassword123!
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
NODE_ENV=development
PORT=8085
```

### After Adding SESSION_SECRET

1. Save the `.env` file
2. Restart your server: `npm run dev`
3. The authentication system is now ready to use

