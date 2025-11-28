import express from 'express'
import {indexCntrl, contactCntrl, hikeCntrl, registerCntrl} from './controllers/viewCntrl.js'

const app = express()
app.use('/', express.static('public'))
app.set("views","./views");
app.set("view engine", "ejs");

app.get('/', indexCntrl)
app.get('/kontakt', contactCntrl)
app.get('/matk/:id', hikeCntrl)
app.get('/matk/:id/registreerumine', registerCntrl)


const port = process.env.PORT || 8085

app.listen(port, () => console.log("Rakendus töötab ja kuulab pordil " + port))