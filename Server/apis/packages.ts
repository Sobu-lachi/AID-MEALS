import express from 'express';
import pool from '../db/db.js';
import { authenticate, type AuthenticatedRequest } from '../middlewares/authenticate.js';

const packageRouter = express.Router();

packageRouter.get('/', authenticate, async (req, res)=>{
    try {
        const packageResult = await pool.query(`SELECT  
            package_id, package_name, description, price,  is_available
            FROM packages WHERE is_available =TRUE`,
            )
        
        const packages = packageResult.rows;

        res.status(200).json({
            packages
        })
    } catch (e) {
        console.error('Package Result error:', e);
        return res.status(500).json({
            message: 'Server Error'
        })
    }
});

export default packageRouter;
