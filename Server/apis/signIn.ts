import express from 'express';
import z from 'zod';
import pool from '../db/db.js'

const signInRouter = express.Router();

const signInSchema = z.object({
    fname: z.string().trim().nonempty("Required field"),
    lname: z.string().trim().nonempty("Required field"),
    email: z.email('Invalid email address'),
    password: z.string().min(4, 'Must be at least 4 characters'),
    phoneNo: z.string().min(10, "Phone number is too short").max(15, "Phone number is too long"),
    school: z.string().trim().nonempty("Required field"),
});

type signInDataType = z.infer<typeof signInSchema>

signInRouter.post('/signin', async (req, res)=>{
    const result = signInSchema.safeParse(req.body);

    try {
        if (!result.success){
            const e = result.error.issues[0]?.message;
            return res.status(400).json({message: e})
        };

        const {fname, lname, email, password, phoneNo, school}: signInDataType = result.data

        await pool.query(`INSERT INTO  users (first_name, last_name, email, password_hash, phone_number, school)
            VALUES ($1, $2, $3, $4, $5, $6 )`,[fname, lname, email, password, phoneNo, school])
        
        res.status(200).json({
            message: 'Successfully created an Account'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
        })
         console.error(error)
    }

    // const {fname, lname}
})



export default signInRouter;