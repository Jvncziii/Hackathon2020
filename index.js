const express  = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto');
const port = process.env.PORT || 2137;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const pool = mysql.createPool({
    connectionLimit : 50,
    host: 'mysql50.mydevil.net',
    user:'m1124_boarApp',
    password:'xXDzik2Xx',
    database:'m1124_webApp'
});

app.post('/veriUsr',(req,res)=>{
    let phoneNumber = req.body.phoneNumber;
    pool.getConnection((err,connection)=>{
        if(err) 
        return res.send(err);
        connection.query("SELECT NrTel FROM `users` WHERE NrTel like '"+phoneNumber+"'",(err,rows) =>{
            connection.release();
            if(err)
            {
               return res.status(err);
            }
            console.log(rows)
                if(rows.length == 0)
                {
                    if(phoneNumber.length != 9)
                    {
                        return res.status(404).send("Niepoprawny numer telefonu");
                    }
                    let veriCode = '';
                    for(let x=0;x<5;x++)
                    {
                        veriCode += Math.floor(Math.random()*(9-0+1))+0;
                    }
                    pool.getConnection((err,connection) =>{
                        if(err)
                        return res.send(err);
                        connection.query("INSERT INTO `users`(`NrTel`,`KodWer`) VALUES ('"+phoneNumber+"','"+veriCode+"')",(err,rows)=>{
                            if(err)
                            res.send(err);
                            connection.release();
                    })

                    });
                   return res.send(veriCode);
                    
                    
                }else
               return res.status(404).send('Error: Taki telefon istnieje w bazie');
                });});
                    
});


app.post('/getHandshake',(req,res) =>{
    let recCode = req.body.veriCode;
    let phoneNumber = req.body.phoneNumber;
    let name = String(Math.floor(Math.random()*(99999-0+1))+0);
    let hash = crypto.createHash('md5').update(name).digest('hex');
    console.log(recCode,' | ',phoneNumber,' | ',hash);
    res.send(hash);
    if(phoneNumber.length != 9)
    {
        return res.status(404).send("Niepoprawny numer telefonu");
    }
    pool.getConnection((err,connection) =>{
        if(err)
        return res.status(404).send(err)
        connection.query("SELECT NrTel,KodWer from users WHERE NrTel like '"+phoneNumber+"'",(err,rows)=>{
            connection.release();
            if(err){
                res.send(err);
                return;
            }
            else if(rows.length == 0){
                console.log('Zły tel');
                res.status(404).send('Podany numer nie jest w bazie danych');
                return;
            }
            else if(rows[0].KodWer != recCode){
                console.log('Zły kod');
                res.status(404).send('Kody nie zgadzają się');
                return;
            }
            else {
                console.log('Dobry Kod i Tel');
                pool.getConnection((err,connection)=>{
                    if(err)
                    return res.status(404).send(err)
                    connection.query("UPDATE `users` SET `Handshake`='"+hash+"' WHERE NrTel like '"+phoneNumber+"'",(err,rows)=>{
                        connection.release();
                        if(err){
                            return res.status(404).send(err);
                        }
                        return res.send(hash);
                    });
                })
            }


        })
    })
    
    
});


app.get('/',(req,res) =>{
    return res.send('witam');
});
app.listen(port);