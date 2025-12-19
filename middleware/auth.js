import { verifyToken } from './tokenUtils.js';

export function requireAuth(req, res, next) {
	// First, check for Bearer token in Authorization header
	const authHeader = req.headers.authorization;
	
	if (authHeader && authHeader.startsWith('Bearer ')) {
		// Extract token from "Bearer <token>"
		const token = authHeader.substring(7);
		const decoded = verifyToken(token);
		
		if (decoded && decoded.username) {
			// Token is valid, attach user to request
			req.user = {
				username: decoded.username
			};
			return next();
		}
		// Token is invalid, continue to check session or return error
	}

	// Fall back to session-based authentication
	if (req.session && req.session.user) {
		// User is authenticated via session, attach user to request for consistency
		req.user = req.session.user;
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

