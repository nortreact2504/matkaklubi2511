
import {join} from 'path'
import {writeFileSync, readFileSync} from 'fs'

const hikesFilePath = join(process.cwd(), process.env.DATA_FILE_HIKES)

let matkad = []

function storeAllHikes() {
    writeFileSync(hikesFilePath, JSON.stringify(matkad))
}

function loadAllHikes() {
    const hikesString = readFileSync(hikesFilePath, 'utf-8')
    matkad = JSON.parse(hikesString)
}

export function initModel() {
    loadAllHikes()
}

export function getHikesModel() {
    loadAllHikes()
    return matkad
}

export function getHike(hikeId) {
    loadAllHikes()
    const hike = matkad.find((matk) => {
        return matk.id === Number(hikeId)
    })
    return hike
}

export function addRegistration(hikeId, name, email) {
    if (!name || !email) {
       return false;
    }
    const hike = getHike(hikeId)
    if (hike) {
        hike.osalejad.push({nimi: name, email: email})
        return true
    } else {
        return false
    }
}

export function addHike({nimetus, kirjeldus, pildiUrl}) {
    const newHike = {
        id: matkad.length + 1,
        nimetus,
        kirjeldus,
        pildiUrl: pildiUrl || '/assets/maed.png',
        osalejad: []
    }

    matkad.push(newHike)
    storeAllHikes()
    return newHike.id
}

export function deleteHike(hikeId) {
    const hike = getHike(hikeId)
    if (!hike) {
        throw new Error("matka ei ole olemas")
    }
   
    matkad = matkad.filter((el) => {
        el.id !== hikeId
    })

}

export function patchHike(hikeId, {nimetus="", kirjeldus=""}) {
    const hike = getHike(hikeId)
    if (!hike) {
        throw new Error("matka ei ole olemas")
    }

    if (nimetus) {
        hike.nimetus = nimetus
    }

    if (kirjeldus) {
        hike.kirjeldus = kirjeldus
    }

    storeAllHikes()

}
