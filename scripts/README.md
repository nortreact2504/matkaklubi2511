# Admin Scripts

This directory contains utility scripts for managing the Matkaklubi application.

## createUser.js

Creates a new admin user in the MongoDB database.

### Usage

```bash
node --env-file=.env scripts/createUser.js
```

### Interactive Prompts

The script will ask you for the following information:

1. **Kasutajanimi (Username)** - Cannot be empty
2. **Parool (Password)** - Must be at least 6 characters
3. **Kinnita parool (Confirm password)** - Must match the password
4. **Roll (Role)** - Optional, defaults to "admin"

### Example Session

```
=== Matkaklubi Admin User Creation ===

Sisesta kasutajanimi: admin
Sisesta parool: ******
Kinnita parool: ******
Sisesta roll (vaikimisi: admin): admin

Loon kasutaja...
✓ Kasutaja "admin" loodud edukalt rolliga "admin"

Saad nüüd sisse logida:
  Kasutajanimi: admin
  URL: http://localhost:8085/login
```

### Error Handling

The script will exit with an error if:
- Username is empty
- Password is less than 6 characters
- Passwords don't match
- User already exists in database
- Database connection fails

### Requirements

- MongoDB connection must be configured in `.env` file
- `MONGODB_USER` and `MONGODB_PASSWORD` must be set
- MongoDB server must be accessible

### Creating Your First Admin User

After setting up the application:

1. Make sure `.env` file has MongoDB credentials
2. Run the createUser script
3. Enter admin credentials
4. Navigate to http://localhost:8085/login
5. Login with the credentials you created

### Security Notes

- Passwords are automatically hashed with bcrypt before storage
- Never store passwords in plain text
- Use strong passwords for production environments
- The script requires environment variables to be loaded

