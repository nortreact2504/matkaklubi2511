import express from 'express'
import session from 'express-session'
import {indexCntrl, contactCntrl, hikeCntrl, registerCntrl} from './controllers/viewCntrl.js'
import { 
    apiAllHikesCntr, 
    apiAddHikeCntrl, 
    apiDeleteHikeCntrl, 
    apiPatchHikeCntrl,
    apiOneHikeDetailsCntrl,
    apiPostParticipantCntrl,
    apiCreateUserCntrl
} from './controllers/apiCntrl.js'
import { adminCtrl } from './controllers/adminViewCntrl.js'
import { loginCtrl, loginPostCtrl, logoutCtrl } from './controllers/authCntrl.js'
import { requireAuth } from './middleware/auth.js'
import { initModel } from './model/hikes.js'
import { closeDatabaseConnection } from './model/hikesMongoDb.js'

const app = express()
app.use('/', express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("views","./views");
app.set("view engine", "ejs");

// Configure express-session middleware
app.use(session({
	secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}))

app.get('/', indexCntrl)
app.get('/kontakt', contactCntrl)
app.get('/matk/:id', hikeCntrl)
app.get('/matk/:id/registreerumine', registerCntrl)

// Authentication routes
app.get('/login', loginCtrl)
app.post('/login', loginPostCtrl)
app.post('/logout', logoutCtrl)

// Protected admin route
app.get('/admin', requireAuth, adminCtrl)

// Public API routes
app.get('/api/matk', apiAllHikesCntr)
app.get('/api/matk/:id', apiOneHikeDetailsCntrl)

// Protected admin API routes
app.post('/api/matk', requireAuth, apiAddHikeCntrl)
app.delete('/api/matk/:id', requireAuth, apiDeleteHikeCntrl)
app.patch('/api/matk/:id', requireAuth, apiPatchHikeCntrl)
app.post('/api/matk/:id/osaleja', apiPostParticipantCntrl)
app.post('/api/user', apiCreateUserCntrl)


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
