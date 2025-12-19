import { MongoClient, ServerApiVersion } from 'mongodb';
import bcrypt from 'bcrypt';

const dbMatkad = 'matkad';
const USERS_COLLECTION_NAME = 'users';
const SALT_ROUNDS = 10;

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

/**
 * Get user by username
 * @param {string} username - The username to search for
 * @returns {Object|null} User object or null if not found
 */
export async function getUserByUsername(username) {
	const usersCollection = await getDatabaseCollection(USERS_COLLECTION_NAME);
	const user = await usersCollection.findOne({ username: username });
	return user;
}

/**
 * Create new user with hashed password
 * @param {string} username - The username
 * @param {string} password - The plain text password (will be hashed)
 * @param {string} role - The user role (default: 'admin')
 * @returns {Object} Result of insert operation
 * @throws {Error} If user already exists
 */
export async function createUser(username, password, role = 'admin') {
	const usersCollection = await getDatabaseCollection(USERS_COLLECTION_NAME);
	
	// Check if user already exists
	const existingUser = await getUserByUsername(username);
	if (existingUser) {
		throw new Error('User already exists');
	}
	
	// Hash password with bcrypt
	const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
	
	// Create user document
	const newUser = {
		username: username,
		passwordHash: passwordHash,
		role: role,
		createdAt: new Date()
	};
	
	const result = await usersCollection.insertOne(newUser);
	console.log(`User created: ${username} with role: ${role}`);
	return result;
}

/**
 * Verify user password
 * @param {string} username - The username
 * @param {string} password - The plain text password to verify
 * @returns {Object|false} User object (without passwordHash) if valid, false otherwise
 */
export async function verifyUserPassword(username, password) {
	const user = await getUserByUsername(username);
	
	if (!user) {
		return false;
	}
	
	// Compare provided password with stored hash
	const isValid = await bcrypt.compare(password, user.passwordHash);
	
	if (isValid) {
		// Return user object without password hash
		const { passwordHash, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}
	
	return false;
}

