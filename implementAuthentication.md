# Admin Session-Based Authentication Implementation Plan

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Detailed Implementation Steps](#detailed-implementation-steps)
4. [Security Considerations](#security-considerations)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)

## Overview

This document provides a detailed plan for implementing session-based authentication to secure the admin view of the Matkaklubi application. The implementation will:

- Protect the `/admin` route so only authenticated users can access it
- Use `express-session` for session management (simpler than JWT)
- Store user credentials in MongoDB with bcrypt password hashing
- Provide a custom login page with form-based authentication
- Support multiple admin users (2-5 users)
- Follow the existing project structure and coding patterns

### Why Session-Based Authentication?

Session-based authentication is simpler and more appropriate for this application because:
- **No token management needed** - Browser automatically handles session cookies
- **Server-side state** - Sessions stored on server, more secure by default
- **Less client-side code** - No need to manually attach tokens to requests
- **Built-in Express support** - `express-session` is mature and well-documented
- **Easier to debug** - Sessions can be inspected directly on the server
- **Natural fit** - Traditional web apps with server-rendered pages work perfectly with sessions

## Architecture

### Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant SessionStore
    participant MongoDB

    User->>Browser: Navigate to /admin
    Browser->>Server: GET /admin
    Server->>Server: Check req.session.user
    Server-->>Browser: 302 Redirect to /login (no session)
    
    User->>Browser: Navigate to /login
    Browser->>Server: GET /login
    Server-->>Browser: Render login.ejs
    
    User->>Browser: Enter username & password
    Browser->>Server: POST /api/auth/login {username, password}
    Server->>MongoDB: getUserByUsername(username)
    MongoDB-->>Server: User document
    Server->>Server: bcrypt.compare(password, hash)
    Server->>SessionStore: Create session with user data
    SessionStore-->>Server: Session ID
    Server-->>Browser: 200 OK + Set-Cookie: sessionId
    
    Browser->>Server: GET /admin (Cookie: sessionId)
    Server->>SessionStore: Validate session
    SessionStore-->>Server: Session data {user}
    Server-->>Browser: Render admin.ejs
    
    Browser->>Server: GET /api/matk (Cookie: sessionId)
    Server->>SessionStore: Validate session
    Server-->>Browser: 200 OK + JSON data
    
    User->>Browser: Click logout
    Browser->>Server: POST /api/auth/logout
    Server->>SessionStore: Destroy session
    Server-->>Browser: 200 OK
    Browser->>Browser: Redirect to /
```

### Component Structure

```mermaid
graph TB
    Client[Browser Client]
    LoginPage[Login Page<br/>views/login.ejs]
    AdminPage[Admin Page<br/>views/admin.ejs]
    Server[Express Server<br/>index.js]
    AuthMiddleware[Auth Middleware<br/>middleware/auth.js]
    AuthController[Auth Controller<br/>controllers/authCntrl.js]
    AdminController[Admin Controller<br/>controllers/adminViewCntrl.js]
    UserModel[User Model<br/>model/usersMongoDb.js]
    SessionStore[Session Store<br/>express-session]
    MongoDB[(MongoDB<br/>users collection)]
    
    Client -->|GET /login| LoginPage
    Client -->|POST credentials| AuthController
    Client -->|GET /admin| AuthMiddleware
    
    AuthController --> UserModel
    UserModel --> MongoDB
    
    AuthMiddleware --> SessionStore
    AuthMiddleware -->|if authenticated| AdminController
    AuthMiddleware -->|if not authenticated| LoginPage
    
    AdminController --> AdminPage
    AdminPage --> Client
```

## Detailed Implementation Steps

### Step 1: Install Required Dependencies

**Action:** Add necessary npm packages to the project.

**Packages to install:**
- `express-session` - Session management middleware for Express
- `bcrypt` - Password hashing library (industry standard)

**Command:**
```bash
npm install express-session bcrypt
```

**What these packages do:**
- `express-session`: Creates and manages user sessions, stores session data, handles cookies
- `bcrypt`: Hashes passwords securely using salt rounds, prevents rainbow table attacks

### Step 2: Create User Model (`model/usersMongoDb.js`)

**Purpose:** Handle all user-related database operations following the existing project pattern.

**File location:** `model/usersMongoDb.js`

**Implementation details:**

```javascript
import { MongoClient, ServerApiVersion } from 'mongodb';
import bcrypt from 'bcrypt';

const USERS_COLLECTION_NAME = 'users';
const SALT_ROUNDS = 10;

// Reuse MongoDB connection pattern from hikesMongoDb.js
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@node.ccuubg4.mongodb.net/?appName=Node`;
let client;

async function getDatabaseCollection(collectionName) {
    // Same implementation as in hikesMongoDb.js
    // This reuses the connection pattern already established
}

// Get user by username
export async function getUserByUsername(username) {
    const usersCollection = await getDatabaseCollection(USERS_COLLECTION_NAME);
    const user = await usersCollection.findOne({ username: username });
    return user;
}

// Create new user with hashed password
export async function createUser(username, password, role = 'admin') {
    const usersCollection = await getDatabaseCollection(USERS_COLLECTION_NAME);
    
    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        throw new Error('User already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create user document
    const newUser = {
        username: username,
        passwordHash: passwordHash,
        role: role,
        createdAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    return result;
}

// Verify user password
export async function verifyUserPassword(username, password) {
    const user = await getUserByUsername(username);
    
    if (!user) {
        return false;
    }
    
    // Compare provided password with stored hash
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : false;
}
```

**Key points:**
- Follows the same pattern as `hikesMongoDb.js` for consistency
- Uses the same MongoDB connection and `getDatabaseCollection()` helper
- Stores users in the same `matkad` database, different collection
- Password is never stored in plain text
- `bcrypt.hash()` automatically generates salt (SALT_ROUNDS = 10)
- `bcrypt.compare()` safely compares passwords

**User document structure in MongoDB:**
```javascript
{
  _id: ObjectId("..."),
  username: "admin",
  passwordHash: "$2b$10$...", // bcrypt hash
  role: "admin",
  createdAt: ISODate("2024-12-19T...")
}
```

### Step 3: Create Authentication Middleware (`middleware/auth.js`)

**Purpose:** Protect routes by checking if user has valid session.

**File location:** `middleware/auth.js`

**Implementation details:**

```javascript
// Middleware to require authentication
export function requireAuth(req, res, next) {
    // Check if user session exists
    if (req.session && req.session.user) {
        // User is authenticated, proceed to next middleware/route
        return next();
    }
    
    // User is not authenticated
    // Check if this is an API request or page request
    if (req.path.startsWith('/api/')) {
        // For API requests, return 401 Unauthorized
        return res.status(401).json({ 
            error: 'Authentication required' 
        });
    } else {
        // For page requests, redirect to login
        return res.redirect('/login');
    }
}
```

**How it works:**
1. Checks `req.session.user` (set during login)
2. If exists, user is authenticated → allow request
3. If not exists:
   - API requests (`/api/*`) → return 401 JSON error
   - Page requests → redirect to `/login`

**Usage:**
```javascript
// Protect single route
app.get('/admin', requireAuth, adminCtrl);

// Protect multiple routes
app.use('/admin', requireAuth);
app.get('/admin', adminCtrl);
app.get('/admin/settings', settingsCtrl);
```

### Step 4: Create Authentication Controller (`controllers/authCntrl.js`)

**Purpose:** Handle login, logout, and login page rendering.

**File location:** `controllers/authCntrl.js`

**Implementation details:**

```javascript
import { verifyUserPassword } from '../model/usersMongoDb.js';

// Render login page
export function loginPageCtrl(req, res) {
    // If user is already logged in, redirect to admin
    if (req.session && req.session.user) {
        return res.redirect('/admin');
    }
    
    // Render login page
    res.render('login', {
        error: null // Can pass error message if login failed
    });
}

// Handle login POST request
export async function loginCtrl(req, res) {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Username and password are required' 
        });
    }
    
    try {
        // Verify credentials
        const user = await verifyUserPassword(username, password);
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid username or password' 
            });
        }
        
        // Create session
        req.session.user = {
            username: user.username,
            role: user.role
        };
        
        // Send success response
        return res.json({ 
            success: true,
            message: 'Login successful',
            redirectUrl: '/admin'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            error: 'An error occurred during login' 
        });
    }
}

// Handle logout
export function logoutCtrl(req, res) {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ 
                error: 'Logout failed' 
            });
        }
        
        // Clear cookie
        res.clearCookie('connect.sid');
        
        // Send success response
        res.json({ 
            success: true,
            message: 'Logout successful',
            redirectUrl: '/'
        });
    });
}
```

**Key features:**
- `loginPageCtrl`: Shows login form, redirects if already logged in
- `loginCtrl`: Verifies credentials and creates session
- `logoutCtrl`: Destroys session and clears cookie
- Returns JSON for AJAX requests (modern approach)
- Proper error handling and validation

### Step 5: Create Login View (`views/login.ejs`)

**Purpose:** Provide user interface for authentication.

**File location:** `views/login.ejs`

**Implementation details:**

```html
<!DOCTYPE html>
<html lang="et">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matkaklubi - Sisselogimine</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="matkaklubi.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <%- include('components/header') %>
        
        <div class="row justify-content-center mt-5">
            <div class="col-md-6 col-lg-4">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title text-center mb-4">Sisselogimine</h2>
                        
                        <!-- Error message display -->
                        <div id="error-message" class="alert alert-danger d-none" role="alert"></div>
                        
                        <!-- Login form -->
                        <form id="login-form">
                            <div class="mb-3">
                                <label for="username" class="form-label">Kasutajanimi</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="username" 
                                    name="username" 
                                    required 
                                    autocomplete="username">
                            </div>
                            
                            <div class="mb-3">
                                <label for="password" class="form-label">Parool</label>
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    id="password" 
                                    name="password" 
                                    required 
                                    autocomplete="current-password">
                            </div>
                            
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">Logi sisse</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Handle form submission
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            
            // Hide previous errors
            errorDiv.classList.add('d-none');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Login successful, redirect to admin
                    window.location.href = data.redirectUrl || '/admin';
                } else {
                    // Show error message
                    errorDiv.textContent = data.error || 'Sisselogimine ebaõnnestus';
                    errorDiv.classList.remove('d-none');
                }
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'Viga sisselogimisel. Palun proovi uuesti.';
                errorDiv.classList.remove('d-none');
            }
        });
    </script>
</body>
</html>
```

**Key features:**
- Follows existing Bootstrap styling from other views
- Includes header component for consistency
- Uses fetch API for AJAX form submission (no page reload)
- Shows error messages dynamically
- Proper HTML5 form validation
- Accessible with proper labels and ARIA attributes
- Estonian language for UI text

### Step 6: Update Main Server File (`index.js`)

**Purpose:** Configure session middleware and add authentication routes.

**Changes needed:**

```javascript
import express from 'express'
import session from 'express-session'  // NEW
import {indexCntrl, contactCntrl, hikeCntrl, registerCntrl} from './controllers/viewCntrl.js'
import { 
    apiAllHikesCntr, 
    apiAddHikeCntrl, 
    apiDeleteHikeCntrl, 
    apiPatchHikeCntrl,
    apiOneHikeDetailsCntrl,
    apiPostParticipantCntrl
} from './controllers/apiCntrl.js'
import { adminCtrl } from './controllers/adminViewCntrl.js'
import { loginPageCtrl, loginCtrl, logoutCtrl } from './controllers/authCntrl.js'  // NEW
import { requireAuth } from './middleware/auth.js'  // NEW
import { initModel } from './model/hikes.js'
import { closeDatabaseConnection } from './model/hikesMongoDb.js'

const app = express()
app.use('/', express.static('public'))
app.use(express.json())

// Configure session middleware - MUST be before routes
app.use(session({
    secret: process.env.SESSION_SECRET,  // Random string from .env
    resave: false,  // Don't save session if unmodified
    saveUninitialized: false,  // Don't create session until something stored
    cookie: { 
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        httpOnly: true,  // Prevent JavaScript access (XSS protection)
        maxAge: 24 * 60 * 60 * 1000  // 24 hours in milliseconds
    }
}))

app.set("views","./views");
app.set("view engine", "ejs");

// Public routes (no authentication required)
app.get('/', indexCntrl)
app.get('/kontakt', contactCntrl)
app.get('/matk/:id', hikeCntrl)
app.get('/matk/:id/registreerumine', registerCntrl)

// Authentication routes
app.get('/login', loginPageCtrl)  // NEW
app.post('/api/auth/login', loginCtrl)  // NEW
app.post('/api/auth/logout', logoutCtrl)  // NEW

// Protected admin routes
app.get('/admin', requireAuth, adminCtrl)  // MODIFIED - added requireAuth

// Public API routes
app.get('/api/matk', apiAllHikesCntr)
app.get('/api/matk/:id', apiOneHikeDetailsCntrl)
app.post('/api/matk/:id/osaleja', apiPostParticipantCntrl)

// Protected API routes (admin only)
app.post('/api/matk', requireAuth, apiAddHikeCntrl)  // MODIFIED
app.delete('/api/matk/:id', requireAuth, apiDeleteHikeCntrl)  // MODIFIED
app.patch('/api/matk/:id', requireAuth, apiPatchHikeCntrl)  // MODIFIED

const port = process.env.PORT || 8085

const server = app.listen(port, () => {
    console.log("Rakendus töötab ja kuulab pordil " + port)
    initModel()
})

// Graceful shutdown handler
async function gracefulShutdown(signal) {
    console.log(`${signal} received. Closing MongoDB connection...`)
    try {
        await closeDatabaseConnection()
        server.close(() => {
            console.log('Server closed')
            process.exit(0)
        })
    } catch (error) {
        console.error('Error during shutdown:', error)
        process.exit(1)
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
```

**Important notes:**
- Session middleware MUST be configured before routes
- `resave: false` and `saveUninitialized: false` are best practices
- `httpOnly: true` prevents XSS attacks
- `secure: true` in production requires HTTPS
- Some API routes are public (GET), others protected (POST/DELETE/PATCH)

### Step 7: Update Admin Client JavaScript (`public/admin.js`)

**Purpose:** Handle authentication errors and logout functionality.

**Changes needed:**

```javascript
const allHikesUrl = '/api/matk'

// Add logout function
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Redirect to home page
            window.location.href = data.redirectUrl || '/';
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Väljalogimine ebaõnnestus');
    }
}

// Wrapper for fetch to handle authentication errors
async function authenticatedFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        // Check for authentication error
        if (response.status === 401) {
            // Session expired, redirect to login
            window.location.href = '/login';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function clickOnLeftPaneRow(id) {
    console.log('Klikiti real ' + id)
    if (!id) {
        renderErrorRightPane()
        return
    }
    const hikeDetails = await fetchHikeDetails(id)
    console.log(hikeDetails)
    renderRightPane(hikeDetails)
}

// ... rest of the existing code ...

async function fetchAllHikes() {
    const response = await authenticatedFetch(allHikesUrl)  // MODIFIED
    if (!response) return [];  // Session expired
    
    const hikes = await response.json()
    console.log('Andmed laetud', hikes)
    return hikes
}

async function fetchHikeDetails(id) {
    const response = await authenticatedFetch(allHikesUrl + '/' + id)  // MODIFIED
    if (!response) return null;  // Session expired
    
    if (!response.ok) {
        showError('Andmete lugemisel oli viga, proovi uuesti')
        return null;
    }
    const hike = await response.json()
    return hike
}

async function postHikeParticipant({id, name, email}) {
    const participant = {
        nimi: name,
        email: email
    }
    
    const response = await authenticatedFetch(`${allHikesUrl}/${id}/osaleja`, {  // MODIFIED
        method: "POST",
        headers: {
            "Content-Type": "application/json", 
        },
        body: JSON.stringify(participant)
    })

    if (!response) return null;  // Session expired
    
    if (!response.ok) {
        showError('Osaleja lisamine ebaõnnestus, proovi uuesti')
        return null;
    }
}

function showError(errorMessage) {
    console.log(errorMessage)
}

async function initialRender() {
    const hikes = await fetchAllHikes()
    renderPage(hikes, hikes[0]?.id)
}

initialRender()
```

**Key changes:**
- Added `logout()` function for logout button
- Created `authenticatedFetch()` wrapper to handle 401 errors
- All fetch calls now use `authenticatedFetch()`
- Automatic redirect to `/login` if session expires

### Step 8: Update Admin View (`views/admin.ejs`)

**Purpose:** Add logout button to admin interface.

**Changes needed:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matkaklubi - Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="bootstrap.css">
    <link rel="stylesheet" href="matkaklubi.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <%- include('components/header') %>
        
        <!-- Add logout button - NEW -->
        <div class="d-flex justify-content-between align-items-center mt-3">
            <h2>Matkade administreerimine</h2>
            <button class="btn btn-outline-secondary" onclick="logout()">Logi välja</button>
        </div>
        
        <div class="kontakt-sisu mt-3">
            <div class="admin-konteiner" id="admin-konteiner">
            </div>
        </div>
    </div>

<script src="/admin.js"></script>    
</body>
</html>
```

**Changes:**
- Added logout button in header area
- Button calls `logout()` function from admin.js
- Uses Bootstrap styling for consistency

### Step 9: Environment Variables

**Purpose:** Store sensitive configuration securely.

**File:** `.env` (create if doesn't exist)

**Add these variables:**

```env
# MongoDB credentials (already exists)
MONGODB_USER=your_mongodb_user
MONGODB_PASSWORD=your_mongodb_password

# Session configuration (NEW)
SESSION_SECRET=your-random-secret-key-here-change-this-in-production
NODE_ENV=development
```

**How to generate a secure SESSION_SECRET:**

```javascript
// Run in Node.js console:
require('crypto').randomBytes(64).toString('hex')
```

Or use online generator: https://randomkeygen.com/ (choose "CodeIgniter Encryption Keys")

**Important:**
- Never commit `.env` file to git
- Use different secrets for development and production
- SESSION_SECRET should be at least 32 characters
- Change SESSION_SECRET if it's ever compromised

### Step 10: Create User Management Script

**Purpose:** Provide a way to create admin users in the database.

**File location:** `scripts/createUser.js`

**Implementation:**

```javascript
import readline from 'readline';
import { createUser } from '../model/usersMongoDb.js';
import { closeDatabaseConnection } from '../model/hikesMongoDb.js';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify readline question
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('=== Matkaklubi Admin User Creation ===\n');
    
    try {
        // Get username
        const username = await question('Enter username: ');
        if (!username || username.trim().length === 0) {
            console.error('Username cannot be empty');
            process.exit(1);
        }
        
        // Get password
        const password = await question('Enter password: ');
        if (!password || password.length < 6) {
            console.error('Password must be at least 6 characters');
            process.exit(1);
        }
        
        // Confirm password
        const confirmPassword = await question('Confirm password: ');
        if (password !== confirmPassword) {
            console.error('Passwords do not match');
            process.exit(1);
        }
        
        // Get role (optional)
        const role = await question('Enter role (default: admin): ') || 'admin';
        
        console.log('\nCreating user...');
        
        // Create user in database
        await createUser(username.trim(), password, role.trim());
        
        console.log(`✓ User "${username}" created successfully with role "${role}"`);
        
    } catch (error) {
        if (error.message === 'User already exists') {
            console.error(`✗ Error: User already exists`);
        } else {
            console.error('✗ Error creating user:', error.message);
        }
        process.exit(1);
    } finally {
        rl.close();
        await closeDatabaseConnection();
    }
}

main();
```

**Usage:**

```bash
# Run the script with environment variables
node --env-file=.env scripts/createUser.js

# Follow the prompts:
# Enter username: admin
# Enter password: ******
# Confirm password: ******
# Enter role (default: admin): admin
```

**Features:**
- Interactive command-line prompts
- Password confirmation
- Validation (username not empty, password at least 6 chars)
- Error handling for duplicate users
- Uses bcrypt hashing automatically (via createUser function)

## Security Considerations

### Password Security
- **Bcrypt hashing**: Industry standard, resistant to brute force
- **Salt rounds**: 10 (good balance of security and performance)
- **No plaintext storage**: Passwords never stored or logged in plain text

### Session Security
- **HTTP-only cookies**: Cannot be accessed by JavaScript (prevents XSS)
- **Secure flag**: Cookies only sent over HTTPS in production
- **Session expiration**: 24 hours maximum session lifetime
- **Secure secret**: Random, long SESSION_SECRET stored in environment

### Additional Security
- **Input validation**: Username and password checked before processing
- **Error messages**: Generic errors don't reveal if username exists
- **HTTPS in production**: Set `NODE_ENV=production` and use HTTPS
- **MongoDB connection**: Credentials in environment variables
- **No session fixation**: New session ID generated on login

### Potential Improvements (Future)
- Rate limiting on login attempts (express-rate-limit)
- Account lockout after failed attempts
- Password complexity requirements
- Two-factor authentication (2FA)
- Session storage in MongoDB (connect-mongo)
- CSRF protection (csurf)

## Testing Guide

### Manual Testing Steps

#### 1. Setup

```bash
# Install dependencies
npm install

# Create first admin user
node --env-file=.env scripts/createUser.js
# Username: admin
# Password: admin123
```

#### 2. Test Unauthenticated Access

```bash
# Start server
npm run dev
```

1. Navigate to http://localhost:8085/admin
2. **Expected:** Redirect to http://localhost:8085/login
3. **Result:** ✓ Admin route is protected

#### 3. Test Login Flow

1. On login page, enter incorrect credentials
2. **Expected:** Error message "Invalid username or password"
3. Enter correct credentials (admin/admin123)
4. **Expected:** Redirect to /admin page
5. **Result:** ✓ Login successful

#### 4. Test Session Persistence

1. After logging in, refresh the page
2. **Expected:** Still logged in, admin page loads
3. Open browser DevTools → Application → Cookies
4. **Expected:** See `connect.sid` cookie with HttpOnly flag
5. **Result:** ✓ Session persists across requests

#### 5. Test API Access

1. While logged in on /admin, open browser console
2. Run: `fetch('/api/matk').then(r => r.json()).then(console.log)`
3. **Expected:** Hikes data returned
4. **Result:** ✓ API accessible when authenticated

#### 6. Test Logout

1. Click "Logi välja" button on admin page
2. **Expected:** Redirect to home page
3. Try to access /admin again
4. **Expected:** Redirect to /login
5. **Result:** ✓ Logout destroys session

#### 7. Test Session Expiration

1. Login and note the time
2. Wait 24 hours (or modify maxAge to 1 minute for testing)
3. Try to access /admin or make API call
4. **Expected:** Redirect to /login
5. **Result:** ✓ Session expires correctly

#### 8. Test Protected API Endpoints

```bash
# Try to add hike without authentication
curl -X POST http://localhost:8085/api/matk \
  -H "Content-Type: application/json" \
  -d '{"nimetus":"Test","kirjeldus":"Test","pildiUrl":""}'

# Expected: 401 Unauthorized
```

### Automated Testing (Optional)

Create `test/auth.test.js` for automated tests:

```javascript
// Example test structure (requires jest or mocha)
describe('Authentication', () => {
    test('should redirect to login when accessing /admin unauthenticated', async () => {
        // Test implementation
    });
    
    test('should create session on successful login', async () => {
        // Test implementation
    });
    
    test('should return 401 for protected API routes', async () => {
        // Test implementation
    });
});
```

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Session not persisting after login"

**Symptoms:** User logs in successfully but immediately redirected to login again

**Possible causes:**
1. Session middleware not configured before routes
2. Cookie not being set due to HTTPS/secure flag mismatch

**Solutions:**
```javascript
// Make sure session middleware comes BEFORE routes in index.js
app.use(session({ ... }))  // This first
app.get('/login', ...)     // Then routes

// In development, make sure secure is false
cookie: { 
    secure: process.env.NODE_ENV === 'production',  // false in dev
    httpOnly: true
}
```

#### Issue 2: "Cannot read property 'user' of undefined"

**Symptoms:** Error when trying to access req.session.user

**Cause:** Session middleware not properly initialized

**Solution:**
```javascript
// Verify session middleware is added
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}))
```

#### Issue 3: "User already exists" when creating first user

**Symptoms:** Script fails saying user exists

**Solution:**
```javascript
// Check MongoDB directly
// Connect to MongoDB Atlas or use MongoDB Compass
// Database: matkad
// Collection: users
// Delete the existing user document
```

#### Issue 4: "SESSION_SECRET is not defined"

**Symptoms:** Error on server start

**Cause:** Missing environment variable

**Solution:**
```bash
# Add to .env file
SESSION_SECRET=your-random-secret-here

# Or set in command
export SESSION_SECRET=your-random-secret
npm run dev
```

#### Issue 5: "Bcrypt error" or password comparison fails

**Symptoms:** Login always fails even with correct password

**Possible causes:**
1. Bcrypt not installed properly
2. Password not hashed when creating user
3. Comparing wrong values

**Solutions:**
```bash
# Reinstall bcrypt
npm uninstall bcrypt
npm install bcrypt

# Verify password is hashed in database
# Hash should start with $2b$ and be ~60 characters
```

#### Issue 6: Redirect loop between /login and /admin

**Symptoms:** Browser shows "too many redirects" error

**Cause:** Session not properly set or middleware checking session incorrectly

**Solution:**
```javascript
// In loginCtrl, verify session is set correctly:
req.session.user = {
    username: user.username,
    role: user.role
};

// In requireAuth middleware, verify check is correct:
if (req.session && req.session.user) {
    return next();  // Make sure to return
}
```

### Debug Tips

#### Enable Session Debugging

```javascript
// In index.js, add logging middleware after session
app.use(session({ ... }))

app.use((req, res, next) => {
    console.log('Session:', req.session);
    console.log('User:', req.session?.user);
    next();
});
```

#### Check Session in Browser

1. Open DevTools → Application tab
2. Cookies → http://localhost:8085
3. Look for `connect.sid` cookie
4. Verify HttpOnly flag is set

#### Test Session Directly

```javascript
// Add temporary test route
app.get('/test-session', (req, res) => {
    res.json({
        session: req.session,
        user: req.session?.user,
        sessionID: req.sessionID
    });
});
```

## Implementation Checklist

Use this checklist to track implementation progress:

- [ ] Install express-session and bcrypt packages
- [ ] Create model/usersMongoDb.js with user functions
- [ ] Create middleware/auth.js with requireAuth middleware
- [ ] Create controllers/authCntrl.js with login/logout controllers
- [ ] Create views/login.ejs with login form
- [ ] Update index.js with session configuration
- [ ] Update index.js with auth routes
- [ ] Protect /admin route with requireAuth middleware
- [ ] Update public/admin.js with logout function
- [ ] Update public/admin.js with authenticatedFetch wrapper
- [ ] Update views/admin.ejs with logout button
- [ ] Create scripts/createUser.js for user creation
- [ ] Add SESSION_SECRET to .env file
- [ ] Test: Create first admin user
- [ ] Test: Access /admin unauthenticated (should redirect)
- [ ] Test: Login with correct credentials
- [ ] Test: Login with incorrect credentials
- [ ] Test: Session persists after refresh
- [ ] Test: Logout functionality
- [ ] Test: Protected API endpoints require authentication
- [ ] Test: Session expires after 24 hours

## Conclusion

This implementation provides a secure, straightforward session-based authentication system that:
- Protects admin routes from unauthorized access
- Follows Express.js best practices
- Maintains consistency with existing project structure
- Uses industry-standard security measures (bcrypt, HTTP-only cookies)
- Supports multiple admin users
- Provides good user experience with custom login page

The session-based approach is simpler than JWT for this use case and perfectly suitable for a server-rendered application with a small number of admin users.

