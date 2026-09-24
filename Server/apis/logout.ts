import express from 'express';
import { createHash } from 'node:crypto';
import pool from '../db/db.js';

const logoutRouter = express.Router();

logoutRouter.post('/logout', async (req, res) => {
    try {
        const sessionToken = req.cookies['__Host-session'];

        // No session cookie exists
        if (!sessionToken) {
            return res.status(204).send();
        }

        // Hash the token so we can find the database session
        const sessionTokenHash = createHash('sha256')
            .update(sessionToken)
            .digest('hex');

        // Revoke the session in the database
        await pool.query(
            `DELETE FROM sessions
             WHERE session_token_hash = $1`,
            [sessionTokenHash]
        );

        // Remove the session cookie from the browser
        res.clearCookie('__Host-session', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        return res.status(204).send();

    } catch (error: unknown) {
        console.error('Error during logout:', error);

        return res.status(500).json({
            message: 'Server Error'
        });
    }
});

export default logoutRouter;