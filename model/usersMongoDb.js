import { MongoClient, ServerApiVersion } from 'mongodb';
import bcrypt from 'bcrypt';

const dbMatkad = 'matkad';
const USERS_COLLECTION_NAME = 'users';

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@node.ccuubg4.mongodb.net/?appName=Node`;

let client;

async function getDatabaseCollection(collectionName) {
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

export async function getUserByUsername(username) {
	if (!username) {
		return null;
	}
	const userCollection = await getDatabaseCollection(USERS_COLLECTION_NAME);
	const user = await userCollection.findOne({ username: username });
	return user;
}

export async function createUser(username, password) {
	if (!username || !password) {
		throw new Error('Username and password are required');
	}

	// Check if user already exists
	const existingUser = await getUserByUsername(username);
	if (existingUser) {
		throw new Error('User already exists');
	}

	// Hash password
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	// Create user document
	const newUser = {
		username: username,
		password: hashedPassword
	};

	const userCollection = await getDatabaseCollection(USERS_COLLECTION_NAME);
	await userCollection.insertOne(newUser);

	return { username: newUser.username };
}

export async function verifyPassword(user, password) {
	if (!user || !password) {
		return false;
	}

	if (!user.password) {
		return false;
	}

	return await bcrypt.compare(password, user.password);
}

export async function updateUserPassword(username, hashedPassword) {
	if (!username || !hashedPassword) {
		throw new Error('Username and password are required');
	}

	const userCollection = await getDatabaseCollection(USERS_COLLECTION_NAME);
	const result = await userCollection.updateOne(
		{ username: username },
		{ $set: { password: hashedPassword } }
	);

	if (result.matchedCount === 0) {
		throw new Error('User not found');
	}

	return true;
}

