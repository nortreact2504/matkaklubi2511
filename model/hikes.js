const matk1 = {
   id: 1,
   nimetus: "Sügismatk Kõrvemaal",
   pildiUrl: "/assets/maed.png",
   kirjeldus: "Lähme ja oleme kolm päeva looduses",
   osalejad: ["mati@matkaja.ee", "kati@matkaja.ee"]
}


const matk2 = {
   id: 2,
   nimetus: "Süstamatk Hiiumaal",
   pildiUrl: "/assets/maed.png",
   kirjeldus: "Lähme ja oleme kolm päeva vee peal",
   osalejad: ["mati@matkaja.ee", "kati@matkaja.ee", "uudo@ryhkija.ee"]
}


const matkad = [
   matk1,
   matk2,
   {
       id: 3,
       nimetus: "Mägimatk Otepääl",
       pildiUrl: "/assets/maed.png",
       kirjeldus: "Lähme ja oleme kolm päeva mägedes",
       osalejad: ["uudo@ryhkija.ee"]
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
