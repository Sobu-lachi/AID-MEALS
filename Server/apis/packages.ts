import express from 'express';
import pool from '../db/db.js';
import { authenticate, type AuthenticatedRequest } from '../middlewares/authenticate.js';

const packageRouter = express.Router();

packageRouter.get('/packages', authenticate, async (req, res)=>{
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


packageRouter.get(
    '/:package_id',
    authenticate,
    async (req, res) => {
        try {
            const packageId = Number(req.params.package_id);

            if (!Number.isInteger(packageId) || packageId <= 0) {
                return res.status(400).json({
                    message: 'Invalid package ID'
                });
            }

            const packageResult = await pool.query(
                `SELECT
                    package_id,
                    package_name,
                    description,
                    price
                 FROM packages
                 WHERE package_id = $1
                 AND is_available = TRUE`,
                [packageId]
            );

            const packageData = packageResult.rows[0];

            if (!packageData) {
                return res.status(404).json({
                    message: 'Package not found'
                });
            }

            const mealsResult = await pool.query(
                `SELECT
                    package_daily_item_id,
                    day_of_week,
                    meal_description
                 FROM package_daily_items
                 WHERE package_id = $1
                 ORDER BY
                    CASE day_of_week
                        WHEN 'Monday' THEN 1
                        WHEN 'Tuesday' THEN 2
                        WHEN 'Wednesday' THEN 3
                        WHEN 'Thursday' THEN 4
                        WHEN 'Friday' THEN 5
                    END`,
                [packageId]
            );

            return res.status(200).json({
                package: packageData,
                daily_meals: mealsResult.rows
            });

        } catch (error: unknown) {
            console.error('Package details error:', error);

            return res.status(500).json({
                message: 'Server Error'
            });
        }
    }
);

export default packageRouter;
