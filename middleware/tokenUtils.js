import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
const TOKEN_EXPIRATION = 24 * 60 * 60; // 24 hours in seconds

/**
 * Generates a JWT token for a user
 * @param {string} username - The username to include in the token payload
 * @returns {string} JWT token
 */
export function generateToken(username) {
	if (!username) {
		throw new Error('Username is required to generate token');
	}

	const payload = {
		username: username
	};

	const options = {
		expiresIn: TOKEN_EXPIRATION
	};

	return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object|null} Decoded token payload if valid, null if invalid
 */
export function verifyToken(token) {
	if (!token) {
		return null;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		return decoded;
	} catch (error) {
		// Token is invalid, expired, or malformed
		return null;
	}
}

