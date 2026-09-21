import express from 'express';
import loginRouter from './apis/login.js';
import signInRouter from './apis/signIn.js'
import pool from './db/db.js';

const app = express();
app.use(express.json());

//Test page
app.get('/', (req,res)=>{
    res.json({"message":"hello World"})
})

//Api for handling LoginPage
app.use('/', loginRouter)

//Api for handling signInPage
app.use('/', signInRouter)



//Testing Server Connection
async function startServer():Promise<void>{
    try {
        await pool.query('SELECT NOW()');
        console.log('Hey you, your fav DB is alive')

        //Listen to port to handle requests and responses
        app.listen(8000, ()=>{
            console.log('Hear Me, Hear Me!!')
        })
    } catch (error:unknown) {
        console.error('I am sorry,I failed you:', error)
        process.exit(1)
    }
}
void startServer();
