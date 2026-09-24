import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './authenticate.js';

type UserRole = 'customer' | 'admin';

export function authorize(...allowedRoles: UserRole[]) {
    return ( req:AuthenticatedRequest, res:Response, next:NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        if (!allowedRoles.includes(req.user.user_role)) {
            res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
            return;
        }

        next();
    };
}