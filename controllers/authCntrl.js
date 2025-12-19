import { getUserByUsername, verifyPassword } from '../model/usersMongoDb.js'
import { generateToken } from '../middleware/tokenUtils.js'

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

export async function apiLoginCtrl(req, res) {
	const { username, password } = req.body

	// Validate input
	if (!username || !password) {
		return res.status(400).json({ error: 'Username and password are required' })
	}

	try {
		// Get user from database
		const user = await getUserByUsername(username)
		
		if (!user) {
			return res.status(401).json({ error: 'Invalid username or password' })
		}

		// Verify password
		const isValidPassword = await verifyPassword(user, password)
		
		if (!isValidPassword) {
			return res.status(401).json({ error: 'Invalid username or password' })
		}

		// Generate JWT token
		const token = generateToken(user.username)

		// Return token and username (do NOT create session)
		return res.status(200).json({
			token: token,
			username: user.username
		})
	} catch (error) {
		console.error('API login error:', error)
		return res.status(500).json({ error: 'An error occurred during login' })
	}
}

