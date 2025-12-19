## Project overview

This project is a web app for a hiking club that enables users to subscribe to different hikes.

The project implements both the frontend and backend of the system.

## Project components

### Backend

The backend is built from **views**, **controllers**, and **model** components.

### Views

Views are EJS templates used for rendering public HTML pages dynamically. They are located in the `views` folder.

### Controllers

Controllers are responsible for processing web requests and compiling responses.  
- `viewCntrl` handles public page web requests.
- `apiCntrl` handles API requests.
- `adminViewCntrl` handles admin view requests for showing pages for administrative tasks.

### Model

Model components are used for storing and retrieving data. The code supports two implementations for storing data:
- File-based storage (file `hikes.js`)
- MongoDB storage (file `hikesMongoDb.js`)

Both files must export **exactly the same functions** with **exactly the same set of parameters** to allow substituting one implementation for the other.

If any other data model components are added, they should follow the same rule.
 
### Routes

All routes are defined in `index.js`. They are roughly divided into two parts:
- Web pages
- API requests

API requests should always have the `api` prefix in the route. API endpoints should conform to REST API principles.

Additionally, all assets and static resources for the frontend are located in the `public` folder.

## Rules to follow

When creating new code, follow the previously described structure unless explicitly instructed otherwise.

When creating frontend code, follow the existing coding style and patterns unless explicitly instructed otherwise.