import express from 'express';
import z from 'zod';
import pool from '../db/db.js'
import argon2 from 'argon2'

const signUpRouter = express.Router();

const signUpSchema = z.object({
    fname: z.string().trim().nonempty("Required field"),
    lname: z.string().trim().nonempty("Required field"),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Must be at least 8 characters'),
    phoneNo: z.string().min(10, "Phone number is too short").max(15, "Phone number is too long"),
    school: z.string().trim().nonempty("Required field"),
});

type signUpDataType = z.infer<typeof signUpSchema>

signUpRouter.post('/signup', async (req, res)=>{
    const result = signUpSchema.safeParse(req.body);

    try {
        if (!result.success){
            const e = result.error.issues[0]?.message;
            return res.status(400).json({message: e})
        };

        const {fname, lname, email, password, phoneNo, school}: signUpDataType = result.data

        // Hashing Passworda
        const passwordHash = await argon2.hash(password, {
                                    type: argon2.argon2id,
                                    memoryCost: 19456,
                                    timeCost: 2,
                                    parallelism:1,
                                    hashLength: 16,
                                    })
        
        // Checking if the email already exists in the database
        const existingUser = await pool.query(`SELECT email FROM users WHERE email = $1`,
            [email]
        );


        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            });
        }
        // Inserting the new user data into the database
        await pool.query(
            `INSERT INTO  users (first_name, last_name, email, password_hash, phone_number, school)
            VALUES ($1, $2, $3, $4, $5, $6 )`, 
            [fname, lname, email, passwordHash, phoneNo, school]);
        
        // Sending a success response to the client
        res.status(201).json({
            message: 'Successfully created an account'
        })
    } catch (error: unknown) {
        res.status(500).json({
            message: 'Server Error',
        })
        console.error('Error during signup:', error);

    }

})



export default signUpRouter;