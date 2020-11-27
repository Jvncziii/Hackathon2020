const express  = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 2137;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/veriUsr',(req,res)=>{
    let phoneNumber = req.body.phoneNumber;
    if(phoneNumber.length != 9)
    {
        throw new Error("Niepoprawny numer telefonu");
        
    }
    let veriCode = '';
    for(let x=0;x<5;x++)
    {
        veriCode += Math.floor(Math.random()*(9-0+1))+0;
    }
    res.send(veriCode);
});
app.get('/',(req,res) =>{
    res.send('witam');
});
app.listen(port);