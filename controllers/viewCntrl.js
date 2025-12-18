import {getHikesModel, getHike, addRegistration} from '../model/hikesMongoDb.js'

export async function indexCntrl(req, res) {
    const matkadArray = await getHikesModel()
    res.render('index', {matkad: matkadArray})
}

export function contactCntrl(req, res) {
    res.render('kontakt')
}

export async function hikeCntrl(req, res) {
    const hikeId = req.params.id
    const hike = await getHike(hikeId)

    console.log(hike)
    //res.send('Näitame matka ' + hike.nimetus)
    res.render('hike', {matk: hike, error: '', success: ''})
}

export async function registerCntrl(req, res) {
    const hikeId = req.params.id
    if (!req.params.id) {
        res.send('Matka ID puudub')
        return
    }

    console.log(req.query, hikeId)
    const name = req.query.nimi
    const email = req.query.email
    //TODO lisada andmete valideerimine
    const lisatud = await addRegistration(hikeId, name, email)
    const hike = await getHike(hikeId)

    if (!lisatud) {
        res.render('hike', {matk: hike, error: 'Registreerumine ebaõnnestus', success: ''})
        return
    }

    res.render('hike', {matk: hike, error: '', success: 'Oled registreeritud matkale'})
}