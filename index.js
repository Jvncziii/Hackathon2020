const express  = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const port = process.env.PORT || 2137;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const pool = mysql.createPool({
    connectionLimit : 50,
    host: 'mysql50.mydevil.net',
    user:'m1124_webApp',
    password:'xXDzik2Xx',
    database:'m1124_webApp'
});

app.post('/veriUsr',(req,res)=>{
    let phoneNumber = req.body.phoneNumber;
    pool.getConnection((err,connection)=>{
        if(err) 
        throw err;
        connection.query("SELECT NrTel where NrTel like '"+phoneNumber+"'FROM users",(err,rows) =>{
            connection.release();
            if(err)
            {
                throw 'Problem z połączeniem';
            }else if(rows.includes(phoneNumber))
            throw 'Telefon istnieje w bazie danych';
        });
    });
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