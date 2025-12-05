
import {join} from 'path'
import {writeFileSync, readFileSync} from 'fs'

const hikesFilePath = join(process.cwd(), 'hikes.json')

const matk1 = {
   id: 1,
   nimetus: "Sügismatk Kõrvemaal",
   pildiUrl: "/assets/maed.png",
   kirjeldus: "Lähme ja oleme kolm päeva looduses",
   osalejad: [ 
    {nimi: 'Mati', email: "mati@matkaja.ee"}, 
    {nimi: 'Kati', email: "kati@matkaja.ee"}
    ]
}


const matk2 = {
   id: 2,
   nimetus: "Süstamatk Hiiumaal",
   pildiUrl: "/assets/maed.png",
   kirjeldus: "Lähme ja oleme kolm päeva vee peal",
   osalejad: []
}


let matkad = [
   matk1,
   matk2,
   {
       id: 3,
       nimetus: "Mägimatk Otepääl",
       pildiUrl: "/assets/maed.png",
       kirjeldus: "Lähme ja oleme kolm päeva mägedes",
       osalejad: []
   }
]

export function loadHikesToCache() {
    const hikesDataString = readFileSync(hikesFilePath, 'utf-8')
    matkad = JSON.parse(hikesDataString)
}

export function getHikesModel() {
    loadHikesToCache()
    return matkad
}

export function getHike(hikeId) {
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
    console.log('Salvestame faili ....')
    writeFileSync(hikesFilePath, JSON.stringify(matkad))
    console.log('Salvestatud')
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

}
