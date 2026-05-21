// services/authService.js
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById } = require('../models/userModel');

let blacklistedTokens = [];

class AuthService {
    
    async login(email, password) {
        const user = findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        
        if (user.password !== password) {
            throw new Error('Invalid email or password');
        }
        
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        
        return {
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            }
            
            // Check if user is active
            if (user.is_active === false) {
                throw new Error('Account is inactive');
            }
            
            // Check if user is soft-deleted
            if (user.deleted_at) {
                throw new Error('Invalid email or password');
            }
            
            // Validate password using bcrypt
            console.log('🔐 Validating password...');
            const isPasswordValid = await validatePassword(user, password);
            console.log('✅ Password validation result:', isPasswordValid);
            
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }
            
            // Generate JWT Token
            const token = jwt.sign(
                {
                    user_id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );
            
            console.log('✅ Login successful, token generated');
            
            return {
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    user_id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active
                }
            };
        } catch (err) {
            console.error('❌ Login error:', err.message);
            throw err;
        }
    }
    
    async logout(token) {
        if (!token) {
            throw new Error('No token provided');
        }
        blacklistedTokens.push(token);
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }
    
    validateToken(token) {
        if (blacklistedTokens.includes(token)) {
            return { valid: false, error: 'Token has been logged out' };
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return {
                valid: true,
                user_id: decoded.user_id,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}

module.exports = new AuthService();