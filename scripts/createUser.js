import readline from 'readline';
import { createUser } from '../model/usersMongoDb.js';
import { closeDatabaseConnection } from '../model/hikesMongoDb.js';

// Create readline interface for user input
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Promisify readline question
function question(prompt) {
	return new Promise((resolve) => {
		rl.question(prompt, resolve);
	});
}

async function main() {
	console.log('=== Matkaklubi Admin User Creation ===\n');
	
	try {
		// Get username
		const username = await question('Sisesta kasutajanimi: ');
		if (!username || username.trim().length === 0) {
			console.error('❌ Kasutajanimi ei saa olla tühi');
			process.exit(1);
		}
		
		// Get password
		const password = await question('Sisesta parool: ');
		if (!password || password.length < 6) {
			console.error('❌ Parool peab olema vähemalt 6 tähemärki pikk');
			process.exit(1);
		}
		
		// Confirm password
		const confirmPassword = await question('Kinnita parool: ');
		if (password !== confirmPassword) {
			console.error('❌ Paroolid ei kattu');
			process.exit(1);
		}
		
		// Get role (optional)
		const role = await question('Sisesta roll (vaikimisi: admin): ') || 'admin';
		
		console.log('\nLoon kasutaja...');
		
		// Create user in database
		await createUser(username.trim(), password, role.trim());
		
		console.log(`✓ Kasutaja "${username}" loodud edukalt rolliga "${role}"`);
		console.log('\nSaad nüüd sisse logida:');
		console.log(`  Kasutajanimi: ${username}`);
		console.log('  URL: http://localhost:8085/login');
		
	} catch (error) {
		if (error.message === 'User already exists') {
			console.error(`\n❌ Viga: Kasutaja juba eksisteerib`);
		} else {
			console.error('\n❌ Viga kasutaja loomisel:', error.message);
		}
		process.exit(1);
	} finally {
		rl.close();
		await closeDatabaseConnection();
	}
}

// Run the script
main();

