import { getHikesModel } from '../model/hikes.js'

export function apiAllHikesCntr(req, res) {
    const matkadArray = getHikesModel()
    res.json(matkadArray.map((matk) => {
        return {
            id: matk.id,
            nimetus: matk.nimetus,
            kirjeldus: matk.kirjeldus,
            osalejateArv: matk.osalejad.length
        }
    }))
}

export function apiAddHikeCntrl(req, res) {
   console.log('Uus matk', req.body)
}