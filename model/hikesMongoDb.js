
import {join} from 'path'
import {writeFileSync, readFileSync} from 'fs'
import { MongoClient, ServerApiVersion } from 'mongodb'

const hikesFilePath = join(process.cwd(), process.env.DATA_FILE_HIKES)

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@node.ccuubg4.mongodb.net/?appName=Node`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


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
        storeAllHikes()
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
