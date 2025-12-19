# This is express project written in javascript

#Structure of the project:

All endpoints are descibed in index.js

All request controllers are situated in folder controller
All data operations are defined in model modules.
There can be separate module for different data storage device (files, mongoDb)

# Environment Variables

Create a `.env` file in the project root. See `docs/env.example` for a template with example values.

Required variables:

- `SESSION_SECRET` - Secret key for session encryption (required for authentication). Use a secure random string in production. Example: `openssl rand -base64 32`
- `MONGODB_USER` - MongoDB username for database connection. Example: `myuser`
- `MONGODB_PASSWORD` - MongoDB password for database connection. Example: `mypassword123`
- `PORT` - Server port (default: 8085). Example: `8085`
- `NODE_ENV` - Environment mode. Example: `development` or `production`
- `DATA_FILE_HIKES` - Path to hikes data file (if using file-based storage instead of MongoDB). Example: `data/hikes.json`
