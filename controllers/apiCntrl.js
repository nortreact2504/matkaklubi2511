import { getHikesModel, patchHike, addHike, getHike, addRegistration } from '../model/hikesMongoDb.js'

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
   const newHike = {
    nimetus: req.body.nimi,
    kirjeldus: req.body.tekst ,
    pildiUrl: req.body.pilt || ''
   }
   addHike(newHike)
   res.status(201). end()
}

export function apiOneHikeDetailsCntrl(req, res) {
    const hikeId = req.params.id
    if (!hikeId) {
        res.status(403).json({
            error: 'id not given in request'
        })
        
        return
    }

    //TODO: loe ühe matka andmed id alusel
    try {
        const hike = getHike(hikeId)
        res.json(hike)
    } catch (error) {
        res.status(404).json({
            error: error.message
        })
    }
    
}


export function apiDeleteHikeCntrl(req, res) {

}

export function apiPatchHikeCntrl(req, res) {
    const hikeId = req.params.id
    const patch = {
        nimetus: req.body.nimetus,
        kirjeldus: req.body.kirjeldus
    }

    try {
        patchHike(hikeId, patch)
        res.status(200).end()
    } catch (error) {
        res.status(403).json({error: error.message})
    }


}

export function apiPostParticipantCntrl(req, res) {
    console.log(req.body)
    addRegistration(req.params.id, req.body.nimi, req.body.email)
    res.status(201).end()
}