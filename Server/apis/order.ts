import express from 'express';
import pool from '../db/db.js';
import { authenticate, type AuthenticatedRequest } from '../middlewares/authenticate.js';
import { z } from 'zod';

const orderRouter = express.Router();

const createOrderSchema = z.object({
    package_id: z.number().int().positive(),
    quantity: z.number().int().positive(),
    delivery_address: z.string().trim().min(5).max(500)
});

orderRouter.post(
    '/order',
    authenticate,
    async (req: AuthenticatedRequest, res) => {
        try {
            const result = createOrderSchema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    message: result.error.issues[0]?.message
                });
            }

            const {
                package_id,
                quantity,
                delivery_address
            } = result.data;

            const userId = req.user!.user_id;

            const packageResult = await pool.query<{
                package_id: number;
                price: string;
            }>(
                `
                SELECT
                    package_id,
                    price
                FROM packages
                WHERE package_id = $1
                AND is_available = TRUE
                `,
                [package_id]
            );

            const packageData = packageResult.rows[0];

            if (!packageData) {
                return res.status(404).json({
                    message: 'Package not found or unavailable'
                });
            }

            const packagePrice = Number(packageData.price);

            const subtotal = packagePrice * quantity;

            const deliveryFee = 500;

            const totalAmount = subtotal + deliveryFee;

            const orderResult = await pool.query(
                `
                INSERT INTO orders (
                    user_id,
                    package_id,
                    quantity,
                    delivery_address,
                    subtotal,
                    delivery_fee,
                    total_amount
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING
                    order_id,
                    user_id,
                    package_id,
                    quantity,
                    delivery_address,
                    subtotal,
                    delivery_fee,
                    total_amount,
                    status,
                    created_at
                `,
                [
                    userId,
                    package_id,
                    quantity,
                    delivery_address,
                    subtotal,
                    deliveryFee,
                    totalAmount
                ]
            );

            return res.status(201).json({
                message: 'Order created successfully',
                order: orderResult.rows[0]
            });
        } catch (error: unknown) {
            console.error('Order creation error:', error);

            return res.status(500).json({
                message: 'Server Error'
            });
        }
    }
);


orderRouter.get(
    '/order/:order_id',
    authenticate,
    async (req: AuthenticatedRequest, res) => {
        try {
            const orderId = Number(req.params.order_id);

            if (!Number.isInteger(orderId) || orderId <= 0) {
                return res.status(400).json({
                    message: 'Invalid order ID'
                });
            }

            const result = await pool.query(
                `
                SELECT
                    o.order_id,
                    o.quantity,
                    o.delivery_address,
                    o.subtotal,
                    o.delivery_fee,
                    o.total_amount,
                    o.status,
                    o.created_at,
                    p.package_id,
                    p.package_name,
                    p.description
                FROM orders o
                INNER JOIN packages p
                    ON p.package_id = o.package_id
                WHERE o.order_id = $1
                AND o.user_id = $2
                `,
                [orderId, req.user!.user_id]
            );

            const order = result.rows[0];

            if (!order) {
                return res.status(404).json({
                    message: 'Order not found'
                });
            }

            return res.status(200).json({
                order
            });
        } catch (error: unknown) {
            console.error('Order retrieval error:', error);

            return res.status(500).json({
                message: 'Server Error'
            });
        }
    }
);

export default orderRouter