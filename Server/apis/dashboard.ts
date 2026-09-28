import express from 'express';
import { authenticate, type AuthenticatedRequest } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import pool from '../db/db.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res) => {
    
    try {
        const userId = req.user!.user_id;

        const statResult = await pool.query<{
            total_orders:string;
            total_expense:string;
            }>(`SELECT COUNT(DISTINCT o.order_id) AS total_orders,
                    COALESCE(
                        SUM(
                            CASE
                                WHEN p.payment_status = 'successful'
                                THEN p.amount
                                ELSE 0
                            END
                        ),0 ) AS total_spent
                 FROM orders o LEFT JOIN payments p
                    ON p.order_id = o.order_id WHERE o.user_id = $1`, [userId]
                );
        
        const recentOrderResult = await pool.query<{
            order_id: number;
            package_name: string;
            status: string;
            total_amount: string;
            created_at: Date;
        }>(`SELECT o.order_id,
                p.package_name,
                o.status,
                o.total_amount,
                o.created_at
                FROM orders o
                INNER JOIN packages p
                ON p.package_id = o.package_id
                WHERE o.user_id = $1
                ORDER BY o.created_at DESC
                LIMIT 5`, [userId]);

        const stat = statResult.rows[0];

            res.status(200).json({
            first_name: `Welcome, ${req.user!.first_name}!`,
            stats:{
                total_orders: Number(stat?.total_orders),
                total_spent: Number(stat?.total_expense)
            },
            recent_order:recentOrderResult.rows
        })
    
    } catch (e:unknown) {
            console.error('Dashboard error:', e);

            return res.status(500).json({
                message: 'Server Error'
            });
    }

});

export default dashboardRouter;