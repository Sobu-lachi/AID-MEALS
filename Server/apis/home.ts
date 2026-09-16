import express from 'express'
import { type Response, type Request } from 'express';

const homeRouter = express.Router();

interface bodyData{
    email: string,
    password: string
}

interface apiResponse{
    success: boolean,
    message: string
}

homeRouter.post('/home', async (req:Request<{},apiResponse, bodyData>, res:Response<apiResponse>)=>{
    const {email, password} = req.body;

    res.json({
        success: true,
        message: 'Heyyyy'
    })

})

export default homeRouter;