import express from 'express';
import loginRouter from './apis/login.js';
import signUpRouter from './apis/signup.js'
import pool from './db/db.js';
import cookieParser from 'cookie-parser';
import DashboardRouter from './apis/dashboard.js';
import logoutRouter from './apis/logout.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

//Test page
app.get('/', (req,res)=>{
    res.json({"message":"hello World"})
})

//Api for handling LoginPage
app.use('/', loginRouter)

//Api for handling signUpPage
app.use('/', signUpRouter)

app.use('/', DashboardRouter)

app.use('/', logoutRouter)

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
