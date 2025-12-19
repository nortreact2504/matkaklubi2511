import { getUserByUsername, verifyPassword } from '../model/usersMongoDb.js'

export function loginCtrl(req, res) {
	// If already logged in, redirect to admin
	if (req.session && req.session.user) {
		return res.redirect('/admin')
	}
	res.render('login', { error: null })
}

export async function loginPostCtrl(req, res) {
	const { username, password } = req.body

	// Validate input
	if (!username || !password) {
		return res.render('login', { error: 'Username and password are required' })
	}

	try {
		// Get user from database
		const user = await getUserByUsername(username)
		
		if (!user) {
			return res.render('login', { error: 'Invalid username or password' })
		}

		// Verify password
		const isValidPassword = await verifyPassword(user, password)
		
		if (!isValidPassword) {
			return res.render('login', { error: 'Invalid username or password' })
		}

		// Create session
		req.session.user = {
			username: user.username
		}

		// Redirect to admin page
		res.redirect('/admin')
	} catch (error) {
		console.error('Login error:', error)
		return res.render('login', { error: 'An error occurred during login' })
	}
}

export function logoutCtrl(req, res) {
	req.session.destroy((err) => {
		if (err) {
			console.error('Logout error:', err)
			return res.status(500).send('Error logging out')
		}
		res.redirect('/login')
	})
}

