import express from 'express'
import z from 'zod';

const homeRouter = express.Router();

const bodyData= z.object({
    email: z.email(),
    password: z.string().min(6)
})

type LoginBody = z.infer<typeof bodyData>


homeRouter.post('/home', async (req, res)=>{
    const result = bodyData.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error 
        });
    }

    const { email, password } = result.data; 

    res.json({
        success: true,
        message: `Welcome back, ${email}!`
    });

})

export default homeRouter;