/**
 * Authentication Middleware
 * Protects routes by checking if user has a valid session
 */

/**
 * Middleware to require authentication
 * Checks if user session exists and redirects/returns error if not authenticated
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function requireAuth(req, res, next) {
	// Check if user session exists
	if (req.session && req.session.user) {
		// User is authenticated, proceed to next middleware/route
		return next();
	}
	
	// User is not authenticated
	// Check if this is an API request or page request
	if (req.path.startsWith('/api/')) {
		// For API requests, return 401 Unauthorized with JSON error
		return res.status(401).json({ 
			error: 'Authentication required',
			message: 'You must be logged in to access this resource'
		});
	} else {
		// For page requests, redirect to login page
		return res.redirect('/login');
	}
}

