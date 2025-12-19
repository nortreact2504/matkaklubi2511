import express from 'express'
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
import { initModel } from './model/hikes.js'
import { closeDatabaseConnection } from './model/hikesMongoDb.js'

const app = express()
app.use('/', express.static('public'))
app.use(express.json())
app.set("views","./views");
app.set("view engine", "ejs");

app.get('/', indexCntrl)
app.get('/kontakt', contactCntrl)
app.get('/matk/:id', hikeCntrl)
app.get('/matk/:id/registreerumine', registerCntrl)
app.get('/admin', adminCtrl)

app.get('/api/matk', apiAllHikesCntr)
app.post('/api/matk', apiAddHikeCntrl)
app.get('/api/matk/:id', apiOneHikeDetailsCntrl)
app.delete('/api/matk/:id', apiDeleteHikeCntrl)
app.patch('/api/matk/:id', apiPatchHikeCntrl)
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
