import express from 'express'
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
import { initModel } from './model/hikes.js'

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


const port = process.env.PORT || 8085

app.listen(port, () => {
    console.log("Rakendus töötab ja kuulab pordil " + port)
    initModel()
})
