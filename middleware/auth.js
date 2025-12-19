export function requireAuth(req, res, next) {
	// Check if user is authenticated (session exists and has user data)
	if (req.session && req.session.user) {
		// User is authenticated, proceed to next middleware/route
		return next();
	}

	// User is not authenticated
	// Check if this is an API route
	if (req.path.startsWith('/api')) {
		// API route - return 401 Unauthorized
		return res.status(401).json({ error: 'Authentication required' });
	} else {
		// View route - redirect to login page
		return res.redirect('/login');
	}
}

