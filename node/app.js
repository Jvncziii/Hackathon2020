const express  = require('express');
const port = 2137;

const app = express();

app.get('/test/:message',(req,res)=>{
    res.send('Ty kurwa bajo jajo a nie '+req.params.message);
});

app.listen(port);