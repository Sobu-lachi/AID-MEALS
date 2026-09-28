import express from 'express';
import { authenticate, type AuthenticatedRequest } from '../middlewares/authenticate.js';
import pool from '../db/db.js';
import z from 'zod';


const profileRouter = express.Router();

const updateProfileSchema = z.object({
    first_name: z.string().trim().min(1).optional(),
    last_name: z.string().trim().min(1).optional(),
    phone_number: z.string().trim().min(10).max(15).optional(),
    school: z.string().trim().min(1).optional(),
    image_url: z.url().optional()
});

// Get Profile data

profileRouter.get('/profile', authenticate, async(req:AuthenticatedRequest, res)=>{
    try{
        const result = await pool.query(`SELECT user_id, first_name, last_name, email, phone_number, school, image_url
            FROM users WHERE user_id= $1`, [req.user!.user_id]);

        const user = result.rows[0]

        if (!user){
            return res.status(404).json({
                message: 'User not found'
            })
        }

        res.status(200).json({
            user
        })
    }catch(e){
        console.error('Profile Error:', e);
        res.status(500).json({
            message:'Server Error'
        })
    }
});


// Modify profile dats 
profileRouter.patch('/profile', authenticate, async(req: AuthenticatedRequest, res)=>{
    try{
    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({
            message: result.error.issues[0]?.message
        })
    };

    const {first_name, last_name, school, phone_number, image_url} = result.data;

    const userId = req.user!.user_id;

    const updatedResult = await pool.query(`UPDATE users
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone_number = COALESCE($3, phone_number),
            school = COALESCE($4, school),
            image_url = COALESCE($5, image_url),
            updated_at = CURRENT_TIMESTAMP

            WHERE user_id = $6

            RETURNING
            user_id,
            first_name,
            last_name,
            email,
            phone_number,
            school,
            image_url,
            updated_at`,
        [first_name ?? null,
        last_name ?? null,
        phone_number ?? null,
        school ?? null,
        image_url ?? null,
        userId]
    )

    const user = updatedResult.rows[0];

            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                message: 'Profile updated successfully',
                user
            });

        } catch (error: unknown) {
            console.error('Profile update error:', error);

            return res.status(500).json({
                message: 'Server Error'
            });
        }

});

export default profileRouter

