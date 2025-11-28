import {getHikesModel, getHike} from '../model/hikes.js'

export function indexCntrl(req, res) {
    const matkadArray = getHikesModel()
    res.render('index', {matkad: matkadArray})
}

export function contactCntrl(req, res) {
    res.render('kontakt')
}

export function hikeCntrl(req, res) {
    const hikeId = req.params.id
    const hike = getHike(hikeId)
    console.log(hike)
    //res.send('Näitame matka ' + hike.nimetus)
    res.render('hike', {matk: hike})
}