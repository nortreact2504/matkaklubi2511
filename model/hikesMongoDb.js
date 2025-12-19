import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const dbMatkad = 'matkad';
const HIKES_COLLECTION_NAME = 'hikes';

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@node.ccuubg4.mongodb.net/?appName=Node`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
let client /* = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true
	}
});
async function testConnection () {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log('Pinged your deployment. You successfully connected to MongoDB!');
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
}
testConnection().catch(console.dir);
*/

async function getDatabaseCollection (collectionName) {
	if (!client) {
		client = new MongoClient(uri, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true
			}
		});
		await client.connect();
	} else {
		// Verify connection is still active, reconnect if needed
		try {
			await client.db('admin').command({ ping: 1 });
		} catch (error) {
			// Connection lost, create new client
			client = new MongoClient(uri, {
				serverApi: {
					version: ServerApiVersion.v1,
					strict: true,
					deprecationErrors: true
				}
			});
			await client.connect();
		}
	}
	const database = client.db(dbMatkad);
	return database.collection(collectionName);
}

export async function closeDatabaseConnection () {
	if (client) {
		await client.close();
		client = null;
	}
}

let matkad = [];

async function loadAllHikes () {
	const hikeCollection = await getDatabaseCollection(HIKES_COLLECTION_NAME)
	const hikesLoaded = await hikeCollection.find().toArray()
	matkad = hikesLoaded.map(el => {
		return { ...el, id:el._id.toString() }
	})
	console.log(matkad)
}

export async function initModel () {
	loadAllHikes();
}

export async function getHikesModel () {
	await loadAllHikes();
	return matkad;
}

export async function getHike (hikeId) {
	await loadAllHikes();
	const hikeIdStr = String(hikeId);
	const hike = matkad.find(matk => {
		return matk.id === hikeIdStr;
	});
	return hike;
}

export async function addRegistration (hikeId, name, email) {
	if (!name || !email) {
		return false;
	}
	const hike = await getHike(hikeId);
	if (hike) {
		const newParticipant = { nimi: name, email };
		hike.osalejad.push(newParticipant);
		
		const hikeCollection = await getDatabaseCollection(HIKES_COLLECTION_NAME);
		const hikeIdObj = new ObjectId(hikeId);
		await hikeCollection.updateOne(
			{ _id: hikeIdObj },
			{ $push: { osalejad: newParticipant } }
		);
		
		return true;
	} else {
		return false;
	}
}

export async function addHike ({ nimetus, kirjeldus, pildiUrl }) {
	const newHike = {
		id: matkad.length + 1,
		nimetus,
		kirjeldus,
		pildiUrl: pildiUrl || '/assets/maed.png',
		osalejad: []
	};

	matkad.push(newHike);

	const hikeCollection = await getDatabaseCollection(HIKES_COLLECTION_NAME);
    const newObject = await hikeCollection.insertOne(newHike)
   
	newHike.id = newObject.insertedId.toString()
	console.log(newHike)
	return newHike.id;
}

export async function deleteHike (hikeId) {
	const hike = await getHike(hikeId);
	if (!hike) {
		throw new Error('matka ei ole olemas');
	}

	const hikeCollection = await getDatabaseCollection(HIKES_COLLECTION_NAME);
	const hikeIdObj = new ObjectId(hikeId);
	await hikeCollection.deleteOne({ _id: hikeIdObj });

	matkad = matkad.filter(el => {
		return el.id !== hikeId;
	});
}

export async function patchHike (hikeId, { nimetus = '', kirjeldus = '' }) {
	const hike = await getHike(hikeId);
	console.log(hike)
	if (!hike) {
		throw new Error('matka ei ole olemas');
	}

	const updateFields = {};
	if (nimetus) {
		hike.nimetus = nimetus;
		updateFields.nimetus = nimetus;
	}

	if (kirjeldus) {
		hike.kirjeldus = kirjeldus;
		updateFields.kirjeldus = kirjeldus;
	}

	console.log('updateFields')

	if (Object.keys(updateFields).length > 0) {
		const hikeCollection = await getDatabaseCollection(HIKES_COLLECTION_NAME);
		console.log('hikeCollection')
		const hikeIdObj = new ObjectId(hikeId);
		await hikeCollection.updateOne(
			{ _id: hikeIdObj },
			{ $set: updateFields }
		);
	}
}
