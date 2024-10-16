import express from 'express';
import { json } from 'body-parser';

const app = express();
app.use(json());

app.get('/api/users/currentuser', (req, res)=> {
    res.send('currentuser');
});

app.listen(3000, () => {
    console.log('AUTH SERVICE: PORT:3000');
});