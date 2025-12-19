import { verifyUserPassword } from '../model/usersMongoDb.js';

/**
 * Render login page
 * If user is already logged in, redirect to admin page
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export function loginPageCtrl(req, res) {
	// If user is already logged in, redirect to admin
	if (req.session && req.session.user) {
		return res.redirect('/admin');
	}
	
	// Render login page
	res.render('login', {
		error: null
	});
}

/**
 * Handle login POST request
 * Verifies credentials and creates session if valid
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function loginCtrl(req, res) {
	const { username, password } = req.body;
	
	// Validate input
	if (!username || !password) {
		return res.status(400).json({ 
			error: 'Kasutajanimi ja parool on kohustuslikud'
		});
	}
	
	try {
		// Verify credentials using user model
		const user = await verifyUserPassword(username, password);
		
		if (!user) {
			return res.status(401).json({ 
				error: 'Vale kasutajanimi või parool'
			});
		}
		
		// Create session with user data
		req.session.user = {
			username: user.username,
			role: user.role
		};
		
		console.log(`User logged in: ${user.username}`);
		
		// Send success response
		return res.json({ 
			success: true,
			message: 'Sisselogimine õnnestus',
			redirectUrl: '/admin'
		});
		
	} catch (error) {
		console.error('Login error:', error);
		return res.status(500).json({ 
			error: 'Sisselogimisel tekkis viga'
		});
	}
}

/**
 * Handle logout
 * Destroys session and clears cookie
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export function logoutCtrl(req, res) {
	const username = req.session?.user?.username;
	
	// Destroy session
	req.session.destroy((err) => {
		if (err) {
			console.error('Logout error:', err);
			return res.status(500).json({ 
				error: 'Väljalogimine ebaõnnestus'
			});
		}
		
		// Clear session cookie
		res.clearCookie('connect.sid');
		
		console.log(`User logged out: ${username}`);
		
		// Send success response
		res.json({ 
			success: true,
			message: 'Väljalogimine õnnestus',
			redirectUrl: '/'
		});
	});
}

