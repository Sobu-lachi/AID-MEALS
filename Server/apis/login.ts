// Add Forgot password later

import express from 'express'
import z from 'zod';
import pool from '../db/db.js';
import argon2 from 'argon2'

const loginRouter = express.Router();

//validating body type of loginSchema with zod
const loginSchema= z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, 'Must be at least 8 characters'),
})

//type-casting zod result
type LoginBody = z.infer<typeof loginSchema>

type userCredentials ={
    user_id: number;
    email: string;
    password_hash: string;
    first_name: string;
}

// Api creation to handle login data
loginRouter.post('/login', async (req, res)=>{
    //Obtaining the data safely from zod object
    const result = loginSchema.safeParse(req.body);

    try {
        // Handling data entry errors
        if (!result.success) {
            const error = result.error.issues[0]?.message
            return res.status(400).json({
                message: error,
            });
        }

        const { email, password }: LoginBody = result.data;

        // Query to check data availability in the database
        const resultData = await pool.query<userCredentials>(`SELECT user_id, email, password_hash, first_name 
            FROM users where email = $1`,
        [email]);
        
        // Assigns the first matching result to users
        const user = resultData.rows[0]

        // console.log(user)

        if (!user){
            return res.status(401).json({
                message: 'Invalid login credentials'
            })
        }


        // Verifying the password with argon2
        const verifiedPword = await argon2.verify(
            user.password_hash,
            password
        )
        // If the password is not verified, return an error response
        if (!verifiedPword){
            return res.status(401).json({
                message: 'Invalid login credentials'
            })
        }

        // Sending a response to the user
        res.json({
            message: `Welcome back, ${user.first_name}!`
        });

    } catch (error: unknown) {
        console.error('Error during login:', error);

        return res.status(500).json({
        message: 'Server Error'
    });
    }
    
});

export default loginRouter;

