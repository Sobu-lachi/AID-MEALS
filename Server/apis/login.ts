import express from 'express'
import z from 'zod';
import pool from '../db/db.js';

const loginRouter = express.Router();

//validating body type of loginSchema with zod
const loginSchema= z.object({
    email: z.email("Invalid email address"),
    password: z.string("Expected String, got Number").min(6, "Must be at least 6 characters long")
})

//type-casting zod result
type LoginBody = z.infer<typeof loginSchema>

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

        await pool.query(
        `INSERT into userz (email , password_hash) VALUES ($1, $2)`,
        [email,password]);
        

        // Sending a response to the user
        res.json({
            message: `Welcome back, ${email}!`
        });

    } catch (error) {
        console.error('Error during login:', error);
    }
    
});

export default loginRouter;