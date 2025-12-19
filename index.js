import express from 'express'
import session from 'express-session'
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
import { loginPageCtrl, loginCtrl, logoutCtrl } from './controllers/authCntrl.js'
import { requireAuth } from './middleware/auth.js'
import { initModel } from './model/hikes.js'
import { closeDatabaseConnection } from './model/hikesMongoDb.js'

const app = express()
app.use('/', express.static('public'))
app.use(express.json())

// Configure session middleware - MUST be before routes
app.use(session({
	secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
	resave: false,
	saveUninitialized: false,
	cookie: { 
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
app.get('/login', loginPageCtrl)
app.post('/api/auth/login', loginCtrl)
app.post('/api/auth/logout', logoutCtrl)

// Protected admin routes
app.get('/admin', requireAuth, adminCtrl)

// Public API routes
app.get('/api/matk', apiAllHikesCntr)
app.get('/api/matk/:id', apiOneHikeDetailsCntrl)
app.post('/api/matk/:id/osaleja', apiPostParticipantCntrl)

// Protected API routes (admin only)
app.post('/api/matk', requireAuth, apiAddHikeCntrl)
app.delete('/api/matk/:id', requireAuth, apiDeleteHikeCntrl)
app.patch('/api/matk/:id', requireAuth, apiPatchHikeCntrl)


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
