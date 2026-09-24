import type { Request, Response, NextFunction } from 'express';
import { createHash } from 'node:crypto';
import pool from '../db/db.js';

type SessionUser = {
    user_id: number;
    email: string;
    user_role: 'customer' | 'admin';
};

type SessionRow = {
    user_id: number;
    email: string;
    user_role: 'customer' | 'admin';
    expires_at: Date;
};

export interface AuthenticatedRequest extends Request {
    user?: SessionUser;
}

export async function authenticate( req:AuthenticatedRequest, res:Response, next:NextFunction): Promise<void> {
    try {
        const sessionToken = req.cookies['__Host-session'];

        if (!sessionToken) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        const sessionTokenHash = createHash('sha256')
            .update(sessionToken)
            .digest('hex');

        const result = await pool.query<SessionRow>(`SELECT s.user_id, s.expires_at, u.email, u.user_role
             FROM sessions s
             INNER JOIN users u
                ON u.user_id = s.user_id
             WHERE s.session_token_hash = $1`,[sessionTokenHash]
        );

        const session = result.rows[0];

        if (!session) {
            res.status(401).json({
                message: 'Invalid session'
            });
            return;
        }

        if (session.expires_at <= new Date()) {
            res.status(401).json({
                message: 'Session expired'
            });
            return;
        }

        req.user = {
            user_id: session.user_id,
            email: session.email,
            user_role: session.user_role
        };

        next();

    } catch (error: unknown) {
        console.error('Authentication error:', error);

        res.status(500).json({
            message: 'Server Error'
        });
    }
}