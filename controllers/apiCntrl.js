import { getHikesModel, patchHike, addHike, getHike, addRegistration } from '../model/hikesMongoDb.js'

export async function apiAllHikesCntr(req, res) {
    const matkadArray = await getHikesModel()
    res.json(matkadArray.map((matk) => {
        return {
            id: matk.id,
            nimetus: matk.nimetus,
            kirjeldus: matk.kirjeldus,
            osalejateArv: matk.osalejad.length
        }
    }))
}

export async function apiAddHikeCntrl(req, res) {
   console.log('Uus matk', req.body)
   const newHike = {
    nimetus: req.body.nimi,
    kirjeldus: req.body.tekst ,
    pildiUrl: req.body.pilt || ''
   }
   await addHike(newHike)
   res.status(201). end()
}

export async function apiOneHikeDetailsCntrl(req, res) {
    const hikeId = req.params.id
    if (!hikeId) {
        res.status(403).json({
            error: 'id not given in request'
        })
        
        return
    }

    //TODO: loe ühe matka andmed id alusel
    try {
        const hike = await getHike(hikeId)
        if (!hike) {
            res.status(404).json({ error: 'Hike not found' })
            return
        }
        res.json(hike)
    } catch (error) {
        res.status(404).json({
            error: error.message
        })
    }
    
}


export function apiDeleteHikeCntrl(req, res) {

}

export async function apiPatchHikeCntrl(req, res) {
    const hikeId = req.params.id
    const patch = {
        nimetus: req.body.nimetus,
        kirjeldus: req.body.kirjeldus
    }

    try {
        await patchHike(hikeId, patch)
        res.status(200).end()
    } catch (error) {
        res.status(403).json({error: error.message})
    }


}

export async function apiPostParticipantCntrl(req, res) {
    console.log(req.body)
    await addRegistration(req.params.id, req.body.nimi, req.body.email)
    res.status(201).end()
}