import express from 'express';
import homeRouter from './apis/home.js';

const app = express();

app.use(express.json());

app.get('/', (req,res)=>{
    res.json({"message":"hello World"})
})

app.use('/', homeRouter)


app.listen(8000, ()=>{
    console.log('Hear Me, Hear Me!!')
})