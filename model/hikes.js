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


const matkad = [
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

export function getHikesModel() {
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
