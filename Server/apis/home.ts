import express from 'express'
import z from 'zod';

const homeRouter = express.Router();

const bodyData= z.object({
    email: z.email("Invalid email address"),
    password: z.string("Expected String, got Number").min(6, "Must be at least 6 characters long")
})

type LoginBody = z.infer<typeof bodyData>


homeRouter.post('/home', async (req, res)=>{
    const result = bodyData.safeParse(req.body);

    if (!result.success) {
        const error = result.error.issues[0]?.message
        return res.status(400).json({
            success: false,
            message: error,
        });
    }

    const { email, password }: LoginBody = result.data;

    console.log(result.data)

    res.json({
        success: true,
        message: `Welcome back, ${email}!`
    });

})

export default homeRouter;